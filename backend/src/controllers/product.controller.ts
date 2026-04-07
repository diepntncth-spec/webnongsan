import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import * as productService from '../services/product.service';

export const getAllProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await productService.getAllProducts();
    res.json(products);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to get products';
    res.status(500).json({ error: msg });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const product_id = parseInt(req.params.id as string, 10);
    const product = await productService.getProductById(product_id);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to get product';
    res.status(500).json({ error: msg });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { garden_id, product_name, type, description, quality, area, species, unit_price } = req.body;

    if (!garden_id || !product_name) {
      res.status(400).json({ error: 'garden_id and product_name are required' });
      return;
    }

    const product = await productService.createProduct({
      garden_id: Number(garden_id),
      product_name,
      type,
      description,
      quality,
      area: area ? Number(area) : undefined,
      species,
      unit_price: unit_price ? Number(unit_price) : undefined,
    });

    res.status(201).json(product);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to create product';
    res.status(400).json({ error: msg });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product_id = parseInt(req.params.id as string, 10);
    const { product_name, type, description, quality, area, species, unit_price, garden_id } = req.body;

    const product = await productService.updateProduct(product_id, {
      product_name,
      type,
      description,
      quality,
      area: area !== undefined ? Number(area) : undefined,
      species,
      unit_price: unit_price !== undefined ? Number(unit_price) : undefined,
      garden_id: garden_id !== undefined ? Number(garden_id) : undefined,
    });

    res.json(product);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to update product';
    res.status(400).json({ error: msg });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product_id = parseInt(req.params.id as string, 10);
    await productService.deleteProduct(product_id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to delete product';
    res.status(400).json({ error: msg });
  }
};

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await productService.getDistinctCategories();
    res.json(categories);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Failed to get categories';
    res.status(500).json({ error: msg });
  }
};
