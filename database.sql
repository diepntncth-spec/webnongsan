-- ============================================================
-- AGRI SYSTEM - SQL Server Database Schema
-- Dựa trên sơ đồ ER đã cung cấp
-- ============================================================

USE master;
GO

-- Tạo database mới
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'AgriSystem')
    CREATE DATABASE AgriSystem
    COLLATE Vietnamese_CI_AS;
GO

USE AgriSystem;
GO

-- ============================================================
-- XÓA BẢNG CŨ (theo thứ tự phụ thuộc)
-- ============================================================
IF OBJECT_ID('Transaction_Detail',  'U') IS NOT NULL DROP TABLE Transaction_Detail;
IF OBJECT_ID('Counterfeit_Report',  'U') IS NOT NULL DROP TABLE Counterfeit_Report;
IF OBJECT_ID('[Transaction]',       'U') IS NOT NULL DROP TABLE [Transaction];
IF OBJECT_ID('Batch',               'U') IS NOT NULL DROP TABLE Batch;
IF OBJECT_ID('Product',             'U') IS NOT NULL DROP TABLE Product;
IF OBJECT_ID('Certification',       'U') IS NOT NULL DROP TABLE Certification;
IF OBJECT_ID('Staff',               'U') IS NOT NULL DROP TABLE Staff;
IF OBJECT_ID('Garden',              'U') IS NOT NULL DROP TABLE Garden;
IF OBJECT_ID('Customer',            'U') IS NOT NULL DROP TABLE Customer;
IF OBJECT_ID('Manager',             'U') IS NOT NULL DROP TABLE Manager;
IF OBJECT_ID('Account',             'U') IS NOT NULL DROP TABLE Account;
GO

-- ============================================================
-- 1. ACCOUNT - Tài khoản đăng nhập
-- ============================================================
CREATE TABLE Account (
    account_id  INT           IDENTITY(1,1) PRIMARY KEY,
    status      VARCHAR(20)   NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active', 'inactive', 'banned')),
    type        VARCHAR(20)   NOT NULL
                              CHECK (type IN ('manager', 'customer', 'staff')),
    username    NVARCHAR(50)  NOT NULL UNIQUE,
    password    NVARCHAR(255) NOT NULL,
    email       NVARCHAR(100) NOT NULL UNIQUE,
    created_at  DATETIME      NOT NULL DEFAULT GETDATE()
);
GO

-- ============================================================
-- 2. MANAGER - Quản lý vườn
-- ============================================================
CREATE TABLE Manager (
    manager_id        INT           IDENTITY(1,1) PRIMARY KEY,
    account_id        INT           NOT NULL UNIQUE
                                    REFERENCES Account(account_id) ON DELETE CASCADE,
    full_name         NVARCHAR(100) NOT NULL,
    managed_id        NVARCHAR(50)  UNIQUE,
    phone_number      NVARCHAR(20),
    organization_name NVARCHAR(100)
);
GO

-- ============================================================
-- 3. CUSTOMER - Khách hàng
-- ============================================================
CREATE TABLE Customer (
    customer_id  INT           IDENTITY(1,1) PRIMARY KEY,
    account_id   INT           NOT NULL UNIQUE
                               REFERENCES Account(account_id) ON DELETE CASCADE,
    full_name    NVARCHAR(100) NOT NULL,
    phone_number NVARCHAR(20),
    update_log   NVARCHAR(MAX)
);
GO

-- ============================================================
-- 4. GARDEN - Vườn trồng
-- ============================================================
CREATE TABLE Garden (
    garden_id       INT            IDENTITY(1,1) PRIMARY KEY,
    manager_id      INT            NOT NULL
                                   REFERENCES Manager(manager_id),
    name            NVARCHAR(100)  NOT NULL,
    area            DECIMAL(10,2)  CHECK (area > 0),
    street          NVARCHAR(100),
    city            NVARCHAR(50),
    soil_type       NVARCHAR(50),
    registered_date DATE           DEFAULT CAST(GETDATE() AS DATE)
);
GO

-- ============================================================
-- 5. STAFF - Nhân viên vườn
-- ============================================================
CREATE TABLE Staff (
    staff_id   INT           IDENTITY(1,1) PRIMARY KEY,
    garden_id  INT           NOT NULL
                             REFERENCES Garden(garden_id) ON DELETE CASCADE,
    account_id INT           UNIQUE
                             REFERENCES Account(account_id),
    full_name  NVARCHAR(100) NOT NULL,
    phone      NVARCHAR(20),
    position   NVARCHAR(50)
);
GO

-- ============================================================
-- 6. CERTIFICATION - Chứng nhận của vườn
-- ============================================================
CREATE TABLE Certification (
    certification_id  INT           IDENTITY(1,1) PRIMARY KEY,
    garden_id         INT           NOT NULL
                                    REFERENCES Garden(garden_id) ON DELETE CASCADE,
    name              NVARCHAR(100) NOT NULL,
    issue_date        DATE          NOT NULL,
    expiry_date       DATE          NOT NULL,
    issuing_authority NVARCHAR(100),
    CONSTRAINT CK_Cert_Dates CHECK (expiry_date > issue_date)
);
GO

-- ============================================================
-- 7. PRODUCT - Sản phẩm nông sản
-- ============================================================
CREATE TABLE Product (
    product_id   INT            IDENTITY(1,1) PRIMARY KEY,
    garden_id    INT            NOT NULL
                                REFERENCES Garden(garden_id),
    product_name NVARCHAR(100)  NOT NULL,
    type         NVARCHAR(50),
    description  NVARCHAR(MAX),
    quality      NVARCHAR(50),
    area         DECIMAL(10,2),
    species      NVARCHAR(100),
    unit_price   DECIMAL(18,2)  CHECK (unit_price >= 0),
    created_at   DATETIME       DEFAULT GETDATE()
);
GO

-- ============================================================
-- 8. BATCH - Lô hàng (mỗi sản phẩm có nhiều lô)
-- ============================================================
CREATE TABLE Batch (
    batch_id         INT           IDENTITY(1,1) PRIMARY KEY,
    product_id       INT           NOT NULL
                                   REFERENCES Product(product_id) ON DELETE CASCADE,
    batch_no         NVARCHAR(50)  NOT NULL UNIQUE,
    harvest_date     DATE,
    expiry_date      DATE,
    initial_quantity DECIMAL(10,2) NOT NULL CHECK (initial_quantity > 0),
    current_quantity DECIMAL(10,2) NOT NULL CHECK (current_quantity >= 0),
    status           NVARCHAR(30)  NOT NULL DEFAULT 'available'
                                   CHECK (status IN ('available', 'sold_out', 'expired', 'dispatched')),
    created_at       DATETIME      DEFAULT GETDATE(),
    CONSTRAINT CK_Batch_Qty   CHECK (current_quantity <= initial_quantity),
    CONSTRAINT CK_Batch_Dates CHECK (expiry_date IS NULL OR harvest_date IS NULL OR expiry_date >= harvest_date)
);
GO

-- ============================================================
-- 9. TRANSACTION - Giao dịch / Đơn hàng của khách
-- ============================================================
CREATE TABLE [Transaction] (
    transaction_id   INT            IDENTITY(1,1) PRIMARY KEY,
    customer_id      INT            NOT NULL
                                    REFERENCES Customer(customer_id),
    transaction_date DATETIME       NOT NULL DEFAULT GETDATE(),
    street           NVARCHAR(100),
    city             NVARCHAR(50),
    status           NVARCHAR(30)   NOT NULL DEFAULT 'pending'
                                    CHECK (status IN ('pending', 'confirmed', 'shipping', 'delivered', 'cancelled')),
    total_amount     DECIMAL(18,2)  NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    notes            NVARCHAR(MAX)
);
GO

-- ============================================================
-- 10. TRANSACTION_DETAIL - Chi tiết giao dịch (Transaction ↔ Batch)
-- ============================================================
CREATE TABLE Transaction_Detail (
    detail_id      INT            IDENTITY(1,1) PRIMARY KEY,
    transaction_id INT            NOT NULL
                                  REFERENCES [Transaction](transaction_id) ON DELETE CASCADE,
    batch_id       INT            NOT NULL
                                  REFERENCES Batch(batch_id),
    unit_price     DECIMAL(18,2)  NOT NULL CHECK (unit_price >= 0),
    quantity       DECIMAL(10,2)  NOT NULL CHECK (quantity > 0),
    subtotal       AS (unit_price * quantity) PERSISTED,
    CONSTRAINT UQ_TxDetail UNIQUE (transaction_id, batch_id)
);
GO

-- ============================================================
-- 11. COUNTERFEIT_REPORT - Báo cáo hàng giả
-- ============================================================
CREATE TABLE Counterfeit_Report (
    report_id     INT           IDENTITY(1,1) PRIMARY KEY,
    customer_id   INT           NOT NULL
                                REFERENCES Customer(customer_id),
    product_id    INT           NOT NULL
                                REFERENCES Product(product_id),
    report_date   DATETIME      NOT NULL DEFAULT GETDATE(),
    location      NVARCHAR(200),
    detected_date DATE,
    fake_method   NVARCHAR(100),
    evidence_url  NVARCHAR(500),
    status        NVARCHAR(30)  NOT NULL DEFAULT 'pending'
                                CHECK (status IN ('pending', 'confirmed', 'rejected')),
    conclusion    NVARCHAR(MAX),
    resolved_by   INT           REFERENCES Manager(manager_id),
    resolved_at   DATETIME
);
GO

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IX_Garden_Manager          ON Garden(manager_id);
CREATE INDEX IX_Staff_Garden            ON Staff(garden_id);
CREATE INDEX IX_Certification_Garden    ON Certification(garden_id);
CREATE INDEX IX_Product_Garden          ON Product(garden_id);
CREATE INDEX IX_Batch_Product           ON Batch(product_id);
CREATE INDEX IX_Batch_Status            ON Batch(status);
CREATE INDEX IX_Transaction_Customer    ON [Transaction](customer_id);
CREATE INDEX IX_Transaction_Status      ON [Transaction](status);
CREATE INDEX IX_TxDetail_Transaction    ON Transaction_Detail(transaction_id);
CREATE INDEX IX_TxDetail_Batch          ON Transaction_Detail(batch_id);
CREATE INDEX IX_Report_Customer         ON Counterfeit_Report(customer_id);
CREATE INDEX IX_Report_Product          ON Counterfeit_Report(product_id);
CREATE INDEX IX_Report_Status           ON Counterfeit_Report(status);
GO

-- ============================================================
-- DỮ LIỆU MẪU
-- ============================================================

-- Account
INSERT INTO Account (type, username, password, email) VALUES
('manager',  'manager1',  '123456', 'manager1@agri.com'),
('customer', 'customer1', '000000', 'customer1@gmail.com'),
('customer', 'customer2', '000000', 'customer2@gmail.com'),
('staff',    'staff1',    '123456', 'staff1@agri.com');

-- Manager
INSERT INTO Manager (account_id, full_name, managed_id, phone_number, organization_name) VALUES
(1, N'Nguyễn Văn Quản', 'MGR001', '0901234567', N'Hợp tác xã Nông nghiệp Xanh');

-- Customer
INSERT INTO Customer (account_id, full_name, phone_number) VALUES
(2, N'Trần Thị Lan',  '0912345678'),
(3, N'Lê Văn Bình',   '0923456789');

-- Garden
INSERT INTO Garden (manager_id, name, area, street, city, soil_type, registered_date) VALUES
(1, N'Vườn Hữu Cơ Đồng Nai', 8500.75, N'Xã Xuân Bảo, huyện Xuân Lộc', N'Đồng Nai', N'Đất bazan', '2023-01-15'),
(1, N'Vườn Rau Sạch Đà Lạt',  3200.00, N'Phường 7',                    N'Đà Lạt',   N'Đất mùn',   '2023-06-01');

-- Staff
INSERT INTO Staff (garden_id, account_id, full_name, phone, position) VALUES
(1, 4, N'Phạm Văn Nhân', '0934567890', N'Nhân viên thu hoạch');

-- Certification
INSERT INTO Certification (garden_id, name, issue_date, expiry_date, issuing_authority) VALUES
(1, N'VietGAP',  '2024-01-01', '2026-01-01', N'Cục Bảo vệ Thực vật'),
(1, N'Hữu cơ',  '2024-03-01', '2026-03-01', N'IFOAM Việt Nam'),
(2, N'VietGAP',  '2024-06-01', '2026-06-01', N'Cục Bảo vệ Thực vật');

-- Product
INSERT INTO Product (garden_id, product_name, type, description, quality, area, species, unit_price) VALUES
(1, N'Rau bina hữu cơ',   N'Rau lá',   N'Rau bina tươi ngon, trồng tiêu chuẩn hữu cơ', N'Hữu cơ',   500.00,  N'Spinacia oleracea',     45000),
(1, N'Cà chua bi cherry',  N'Trái cây', N'Cà chua bi ngọt, da mịn, giàu vitamin',         N'Loại 1',   800.00,  N'Solanum lycopersicum',  65000),
(2, N'Dâu tây Đà Lạt',    N'Trái cây', N'Dâu tây tươi, vị ngọt chua đặc trưng',           N'Loại 1',  1200.00,  N'Fragaria × ananassa',  120000),
(2, N'Rau muống nước',    N'Rau lá',   N'Rau muống tươi sạch, giòn ngọt',                N'VietGAP',   300.00,  N'Ipomoea aquatica',      18000);

-- Batch
INSERT INTO Batch (product_id, batch_no, harvest_date, expiry_date, initial_quantity, current_quantity, status) VALUES
(1, 'BATCH-RB-001', '2026-04-01', '2026-04-07',  200.00, 150.00, 'available'),
(1, 'BATCH-RB-002', '2026-04-05', '2026-04-11',  300.00, 300.00, 'available'),
(2, 'BATCH-CT-001', '2026-04-02', '2026-04-09',  150.00,  80.00, 'available'),
(3, 'BATCH-DT-001', '2026-04-03', '2026-04-08',   50.00,  50.00, 'available'),
(4, 'BATCH-RM-001', '2026-04-05', '2026-04-10',  500.00, 420.00, 'available');

-- Transaction
INSERT INTO [Transaction] (customer_id, street, city, status, total_amount, notes) VALUES
(1, N'123 Nguyễn Huệ, P.Bến Nghé', N'TP.HCM',  'delivered', 225000, N'Giao buổi sáng'),
(2, N'45 Trần Phú',                  N'Đà Nẵng', 'pending',   120000, NULL);

-- Transaction_Detail (chi tiết đơn hàng)
INSERT INTO Transaction_Detail (transaction_id, batch_id, unit_price, quantity) VALUES
(1, 1, 45000,  3.00),   -- 3kg rau bina
(1, 3, 65000,  1.50),   -- 1.5kg cà chua
(2, 4, 120000, 1.00);   -- 1kg dâu tây

-- Counterfeit_Report
INSERT INTO Counterfeit_Report (customer_id, product_id, location, detected_date, fake_method, status) VALUES
(1, 2, N'Chợ Bình Thạnh, TP.HCM', '2026-04-03', N'Nhãn mác giả, giá rẻ bất thường', 'pending'),
(2, 1, N'Siêu thị Big C Đà Nẵng',  '2026-04-04', N'Bao bì giả mạo thương hiệu',       'pending');
GO

-- ============================================================
-- KIỂM TRA DỮ LIỆU
-- ============================================================
SELECT 'Account'            AS [Table], COUNT(*) AS [Rows] FROM Account
UNION ALL
SELECT 'Manager',            COUNT(*) FROM Manager
UNION ALL
SELECT 'Customer',           COUNT(*) FROM Customer
UNION ALL
SELECT 'Garden',             COUNT(*) FROM Garden
UNION ALL
SELECT 'Staff',              COUNT(*) FROM Staff
UNION ALL
SELECT 'Certification',      COUNT(*) FROM Certification
UNION ALL
SELECT 'Product',            COUNT(*) FROM Product
UNION ALL
SELECT 'Batch',              COUNT(*) FROM Batch
UNION ALL
SELECT 'Transaction',        COUNT(*) FROM [Transaction]
UNION ALL
SELECT 'Transaction_Detail', COUNT(*) FROM Transaction_Detail
UNION ALL
SELECT 'Counterfeit_Report', COUNT(*) FROM Counterfeit_Report;
GO
