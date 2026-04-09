USE master;
GO

-- Tạo database mới
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'AgriSystem')
    CREATE DATABASE AgriSystem
    COLLATE Vietnamese_CI_AS;
GO

USE AgriSystem;
GO

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

CREATE TABLE Customer (
    customer_id  INT           IDENTITY(1,1) PRIMARY KEY,
    account_id   INT           NOT NULL UNIQUE
                               REFERENCES Account(account_id) ON DELETE CASCADE,
    full_name    NVARCHAR(100) NOT NULL,
    phone_number NVARCHAR(20),
    update_log   NVARCHAR(MAX)
);
GO

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

SELECT 'Transaction',        COUNT(*) FROM [Transaction]
UNION ALL
SELECT 'Transaction_Detail', COUNT(*) FROM Transaction_Detail
UNION ALL
SELECT 'Counterfeit_Report', COUNT(*) FROM Counterfeit_Report;
GO
