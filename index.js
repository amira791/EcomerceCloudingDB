// Dans index.js

import express from 'express';
import cors from 'cors'; 
import {searchProducts,getProductReviews ,getProductReviewsUser,getCategories,getProductsCount, getProducts, getProductDetailsById , getTopProducts , get_most_reviewed_products , get_highest_rated_products , get_categories_with_most_products , get_Most_Expensive_ordered_products , calculate_total_stock_value, addProduct, deleteProduct, updateProduct} from './model.js';

const app = express();
const port = 3001;
app.use(express.json());
app.use(cors());

app.get('/products', async (req, res) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits.' });
  }
});
app.get('/Categories', async (req, res) => {
  try {
    const products = await getCategories();
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la récupération des produits.' });
  }
});
app.get('/nbproducts', async (req, res) => {
  try {
    const count = await getProductsCount();
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du nombre de produits.' });
  }
});


app.get('/products/:idProduct', async (req, res) => {
    const { idProduct } = req.params;
    try {
      const productDetails = await getProductDetailsById(idProduct);
      res.json(productDetails);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la récupération des détails du produit.' });
    }
  });



  app.get('/reviews/:productId', async (req, res) => {
    const { productId } = req.params; // Récupérer l'ID du produit depuis les paramètres de la requête

  try {
    // Appeler la fonction getProductReviews pour récupérer les avis sur le produit
    const reviews = await getProductReviews(productId);
    
    // Envoyer les avis récupérés en réponse
    res.json(reviews);
  } catch (error) {
    // En cas d'erreur, envoyer un message d'erreur avec le code de statut 500 (Internal Server Error)
    res.status(500).json({ error: 'Erreur lors de la récupération des avis sur le produit.' });
  }
});

app.get('/user/:userId', async (req, res) => {
  const { userId } = req.params; // Récupérer l'ID du produit depuis les paramètres de la requête

try {
  // Appeler la fonction getProductReviews pour récupérer les avis sur le produit
  const reviews = await getProductReviewsUser(userId);
  
  // Envoyer les avis récupérés en réponse
  res.json(reviews);
} catch (error) {
  // En cas d'erreur, envoyer un message d'erreur avec le code de statut 500 (Internal Server Error)
  res.status(500).json({ error: 'Erreur lors de la récupération des avis sur le produit.' });
}
});

  app.get('/top-products', async (req, res) => {
    const { startDate, endDate } = req.query;
    // Vérifiez si les dates startDate et endDate sont fournies dans la requête
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Veuillez fournir à la fois startDate et endDate dans la requête.' });
    }

    try {
      // Convertir les dates de chaînes en objets Date
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);

      // Vérifiez si les dates sont valides
      if (isNaN(startDateObj.getTime()) || isNaN(endDateObj.getTime())) {
        return res.status(400).json({ error: 'Les dates fournies ne sont pas valides.' });
      }

      const topProducts = await getTopProducts(startDateObj, endDateObj);
      res.json(topProducts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la récupération des produits les plus demandés.' });
    }
  });

  app.get('/Most_reviewed_products', async (req, res) => {
    try {
      const topProducts = await get_most_reviewed_products();
      res.json(topProducts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la récupération des produits les plus demandés.' });
    }
  });
  
  
  app.get('/Highest_rated_products', async (req, res) => {
    try {
      const topProducts = await get_highest_rated_products();
      res.json(topProducts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la récupération des produits les plus demandés.' });
    }
  });
  

  app.get('/Categories_with_most_products', async (req, res) => {
    try {
      const topProducts = await get_categories_with_most_products();
      res.json(topProducts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la récupération des produits les plus demandés.' });
    }
  });
  
  app.get('/Most_Expensive_ordered_products', async (req, res) => {
    try {
      const topProducts = await get_Most_Expensive_ordered_products();
      res.json(topProducts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la récupération des produits les plus demandés.' });
    }
  });

  app.get('/total_stock_value', async (req, res) => {
    try {
      const stockValue = await calculate_total_stock_value();
      res.json({ total_stock_value: stockValue });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur lors de la récupération de la valeur totale du stock.' });
    }
  });

//   app.post('/addProduct', async (req, res) => {
//     try {
//         const {nameProduct, quantity, price } = req.body; 
        
//         await addProduct( nameProduct, quantity, price);

//         res.status(201).json({ message: 'Produit ajouté avec succès.' });
//     } catch (error) {
//         console.error('Erreur lors de l\'ajout du produit :', error);
//         res.status(500).json({ error: 'Erreur lors de l\'ajout du produit.' });
//     }
// });

app.post('/addProduct', async (req, res) => {
  const { nameProduct, quantity, price, categoryList } = req.body;
  try {
      await addProduct(nameProduct, quantity, price, categoryList);
      res.status(200).json({ message: 'Produit ajouté avec succès.' });
  } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
      res.status(500).json({ message: 'Échec de l\'ajout du produit.' });
  }
});

app.delete('/deleteProduct/:id', async (req, res) => {
    const productId = parseInt(req.params.id);

    try {
        // Appeler la fonction deleteProduct avec l'ID du produit à supprimer
        await deleteProduct(productId);
        
        res.status(200).json({ message: 'Produit supprimé avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la suppression du produit :', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du produit.' });
    }
});

app.put('/updateProduct/:id', async (req, res) => {
    const productId = parseInt(req.params.id);
    const { nameProduct, quantity, price } = req.body;

    try {
        // Appeler la fonction updateProduct avec les données mises à jour du produit
        await updateProduct(productId, nameProduct, quantity, price);

        res.status(200).json({ message: 'Produit mis à jour avec succès.' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du produit :', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du produit.' });
    }
});


app.get('/product_search', async (req, res) => {
  const { searchKeyword, maxPrice, minQuantity, categoryId } = req.query;

  try {
      const products = await searchProducts(searchKeyword, maxPrice, minQuantity, categoryId);
      res.json(products);
  } catch (error) {
      console.error('Une erreur s\'est produite lors de la recherche de produits :', error);
      res.status(500).json({ error: 'Une erreur s\'est produite lors de la recherche de produits.' });
  }
});


  app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
