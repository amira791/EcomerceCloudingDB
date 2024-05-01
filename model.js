// Dans model.js

import oracledb from 'oracledb';

async function connectDB() {
  try {
    const connection = await oracledb.getConnection({
      user: 'sys',
      password: 'sys',
      connectString: 'localhost:1521/FREE',
      privilege: oracledb.SYSDBA
    });
    return connection;
  } catch (error) {
    console.error('Erreur de connexion à la base de données :', error);
    throw error;
  }
}

async function getProducts() {
  let connection;
  try {
    connection = await connectDB();
    const result = await connection.execute('SELECT * FROM Products');
    return result.rows;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits :', error);
    throw error;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (error) {
        console.error('Erreur lors de la fermeture de la connexion :', error);
      }
    }
  }
}
async function getCategories() {
    let connection;
    try {
      connection = await connectDB();
      const result = await connection.execute('SELECT * FROM Categories');
      return result.rows;
    } catch (error) {
      console.error('Erreur lors de la récupération des produits :', error);
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error('Erreur lors de la fermeture de la connexion :', error);
        }
      }
    }
  }
async function getProductsCount() {
    let connection;
    try {
      connection = await connectDB(); // Assuming connectDB() function is defined elsewhere
      const result = await connection.execute('SELECT COUNT(*) AS product_count FROM Products');
    //   console.log(result.rows[0][0]);
      return result.rows[0][0];
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre de produits :', error);
      throw error;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (error) {
          console.error('Erreur lors de la fermeture de la connexion :', error);
        }
      }
    }
  }
  
async function getProductDetailsById(productId) {
    let connection;
    try {
        connection = await connectDB();
        const result = await connection.execute(`
            SELECT *
            FROM Products p
            WHERE p.idProduct = :productId
        `, [productId]);

        // Vérification des données renvoyées par la base de données
        if (!result || !result.rows) {
            throw new Error('Aucune donnée renvoyée par la base de données.');
        }

        const serializedData = JSON.stringify(result.rows);
        console.log('Données sérialisées en JSON :', serializedData);

        // Afficher le résultat sur la console
        console.log('Résultat de la requête SQL :', result.rows);

        // Retourner directement les résultats
        return result.rows;
    } catch (error) {
        console.error('Erreur lors de la récupération des détails du produit :', error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Erreur lors de la fermeture de la connexion :', error);
            }
        }
    }
}

async function getProductReviews(productId) {
    let connection;
    try {
        connection = await connectDB();
        const result = await connection.execute(`
            SELECT
                r.IDREVIEW,
                r.PRODUCTID,
                r.USERID,
                r.RATING,
                r.REVIEWDATE,
                DBMS_LOB.SUBSTR(r.REVIEWCOMMENT, 4000, 1) AS REVIEWCOMMENT
            FROM
                Reviews r
            WHERE
                r.productId = :productId
        `, [productId]);

        // Vérification des données renvoyées par la base de données
        if (!result || !result.rows) {
            throw new Error('Aucune donnée renvoyée par la base de données.');
        }

        // Convertir les données en un tableau d'objets JavaScript
        const reviews = result.rows.map(row => {
            // Convertir chaque ligne en un objet JavaScript
            const review = {};
            result.metaData.forEach((meta, index) => {
                // Utiliser les noms de colonnes comme clés et les valeurs de lignes correspondantes
                review[meta.name] = row[index];
            });
            return review;
        });

        // Retourner directement les résultats
        return reviews;
    } catch (error) {
        console.error('Erreur lors de la récupération des détails du produit :', error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Erreur lors de la fermeture de la connexion :', error);
            }
        }
    }
}



async function getProductReviewsUser(userId) {
    let connection;
    try {
        connection = await connectDB();
        const result = await connection.execute(`
            SELECT *
            FROM Users u
            WHERE u.idUser = :userId
        `, [userId]);

        // Vérification des données renvoyées par la base de données
        if (!result || !result.rows) {
            throw new Error('Aucune donnée renvoyée par la base de données.');
        }

        const serializedData = JSON.stringify(result.rows);
        console.log('Données sérialisées en JSON :', serializedData);

        // Afficher le résultat sur la console
        console.log('Résultat de la requête SQL :', result.rows);

        // Retourner directement les résultats
        return result.rows;
    } catch (error) {
        console.error('Erreur lors de la récupération des détails du produit :', error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Erreur lors de la fermeture de la connexion :', error);
            }
        }
    }
}


async function extractLobContent(lob) {
    let lobContent = '';
    return new Promise((resolve, reject) => {
        lob.on('data', (chunk) => {
            lobContent += chunk.toString(); // Convert chunk to string
        });
        lob.on('end', () => {
            resolve(lobContent); // Resolve promise with lob content
        });
        lob.on('error', (error) => {
            reject(error); // Reject promise if error occurs
        });
    });
}


async function getTopProducts(startDate, endDate) {
    let connection;

    try {
        // Établir une connexion à la base de données Oracle
        connection = await oracledb.getConnection({
            user: 'sys',
            password: 'sys',
            connectString: 'localhost:1521/FREE',
            privilege: oracledb.SYSDBA
          });

        // Appeler la fonction PL/SQL et récupérer les résultats
        const result = await connection.execute(
            `BEGIN
                :cursor := get_top_products(:start_date, :end_date);
            END;`,
            {
                cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
                start_date: startDate,
                end_date: endDate
            }
        );

        // Lire les résultats du curseur
        const resultSet = result.outBinds.cursor;
        let rows = [];
        let row;

        while ((row = await resultSet.getRow())) {
            rows.push(row);
        }

        // Fermer le curseur
        await resultSet.close();

        return rows;
    } catch (error) {
        console.error('Erreur lors de l\'appel de la fonction PL/SQL :', error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Erreur lors de la fermeture de la connexion :', error);
            }
        }
    }
}


async function get_most_reviewed_products() {
    let connection;

    try {
        // Établir une connexion à la base de données Oracle
        connection = await oracledb.getConnection({
            user: 'sys',
            password: 'sys',
            connectString: 'localhost:1521/FREE',
            privilege: oracledb.SYSDBA
          });

        // Appeler la fonction PL/SQL et récupérer les résultats
        const result = await connection.execute(
            `BEGIN
                :cursor := get_most_reviewed_products();
            END;`,
            {
                cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
            }
        );

        // Lire les résultats du curseur
        const resultSet = result.outBinds.cursor;
        let rows = [];
        let row;

        while ((row = await resultSet.getRow())) {
            rows.push(row);
        }

        // Fermer le curseur
        await resultSet.close();

        return rows;
    } catch (error) {
        console.error('Erreur lors de l\'appel de la fonction PL/SQL :', error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Erreur lors de la fermeture de la connexion :', error);
            }
        }
    }
}

async function get_highest_rated_products() {
    let connection;

    try {
        // Établir une connexion à la base de données Oracle
        connection = await oracledb.getConnection({
            user: 'sys',
            password: 'sys',
            connectString: 'localhost:1521/FREE',
            privilege: oracledb.SYSDBA
          });

        // Appeler la fonction PL/SQL et récupérer les résultats
        const result = await connection.execute(
            `BEGIN
                :cursor := get_highest_rated_products();
            END;`,
            {
                cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
            }
        );

        // Lire les résultats du curseur
        const resultSet = result.outBinds.cursor;
        let rows = [];
        let row;

        while ((row = await resultSet.getRow())) {
            rows.push(row);
        }

        // Fermer le curseur
        await resultSet.close();

        return rows;
    } catch (error) {
        console.error('Erreur lors de l\'appel de la fonction PL/SQL :', error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Erreur lors de la fermeture de la connexion :', error);
            }
        }
    }
}

async function get_categories_with_most_products() {
    let connection;

    try {
        // Établir une connexion à la base de données Oracle
        connection = await oracledb.getConnection({
            user: 'sys',
            password: 'sys',
            connectString: 'localhost:1521/FREE',
            privilege: oracledb.SYSDBA
          });

        // Appeler la fonction PL/SQL et récupérer les résultats
        const result = await connection.execute(
            `BEGIN
                :cursor := get_categories_with_most_products();
            END;`,
            {
                cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
            }
        );

        // Lire les résultats du curseur
        const resultSet = result.outBinds.cursor;
        let rows = [];
        let row;

        while ((row = await resultSet.getRow())) {
            rows.push(row);
        }

        // Fermer le curseur
        await resultSet.close();

        return rows;
    } catch (error) {
        console.error('Erreur lors de l\'appel de la fonction PL/SQL :', error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Erreur lors de la fermeture de la connexion :', error);
            }
        }
    }
}


async function  get_Most_Expensive_ordered_products() {
    let connection;

    try {
        // Établir une connexion à la base de données Oracle
        connection = await oracledb.getConnection({
            user: 'sys',
            password: 'sys',
            connectString: 'localhost:1521/FREE',
            privilege: oracledb.SYSDBA
          });

        // Appeler la fonction PL/SQL et récupérer les résultats
        const result = await connection.execute(
            `BEGIN
                :cursor := get_Most_Expensive_ordered_products();
            END;`,
            {
                cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
            }
        );

        // Lire les résultats du curseur
        const resultSet = result.outBinds.cursor;
        let rows = [];
        let row;

        while ((row = await resultSet.getRow())) {
            rows.push(row);
        }

        // Fermer le curseur
        await resultSet.close();

        return rows;
    } catch (error) {
        console.error('Erreur lors de l\'appel de la fonction PL/SQL :', error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Erreur lors de la fermeture de la connexion :', error);
            }
        }
    }
}

async function calculate_total_stock_value() {
    let connection;

    try {
        // Établir une connexion à la base de données Oracle
        connection = await oracledb.getConnection({
            user: 'sys',
            password: 'sys',
            connectString: 'localhost:1521/FREE',
            privilege: oracledb.SYSDBA
        });

        // Appeler la fonction PL/SQL et récupérer les résultats
        const result = await connection.execute(
            `BEGIN
                :total_stock_value := calculate_total_stock_value();
            END;`,
            {
                total_stock_value: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
            }
        );

        // Récupérer la valeur de retour
        const totalStockValue = result.outBinds.total_stock_value;

        return totalStockValue;
    } catch (error) {
        console.error('Erreur lors de l\'appel de la fonction PL/SQL :', error);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('Erreur lors de la fermeture de la connexion :', error);
            }
        }
    }
}

// async function addProduct(p_name, p_quantity, p_price) {
//     let connection;

//     try {
//         // Établir une connexion à la base de données Oracle
//         connection = await oracledb.getConnection({
//             user: 'sys',
//             password: 'sys',
//             connectString: 'localhost:1521/FREE',
//             privilege: oracledb.SYSDBA
//         });

//         await connection.execute(
//             `BEGIN
//                add_product(:p_name, :p_quantity, :p_price);
//             END;`,
//             {
//                 p_name: { dir: oracledb.BIND_IN, val: p_name },
//                 p_quantity: { dir: oracledb.BIND_IN, val: p_quantity },
//                 p_price: { dir: oracledb.BIND_IN, val: p_price }
//             }
//         );

//         console.log('Produit ajouté avec succès.');
//     } catch (error) {
//         console.error('Erreur lors de l\'ajout du produit :', error);
//         throw error;
//     } finally {
//         if (connection) {
//             try {
//                 // Fermer la connexion
//                 await connection.close();
//             } catch (error) {
//                 console.error('Erreur lors de la fermeture de la connexion :', error);
//             }
//         }
//     }
// }

async function deleteProduct(p_idProduct) {
    let connection;

    try {
        // Établir une connexion à la base de données Oracle
        connection = await oracledb.getConnection({
            user: 'sys',
            password: 'sys',
            connectString: 'localhost:1521/FREE',
            privilege: oracledb.SYSDBA
        });

        const result = await connection.execute(
            `BEGIN
                delete_product(:p_idProduct);
            END;`,
            {
                p_idProduct: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: p_idProduct }
            }
        );

        console.log('Produit supprimé avec succès.');
    } catch (error) {
        console.error('Erreur lors de la suppression du produit :', error);
        throw error;
    } finally {
        if (connection) {
            try {
                // Fermer la connexion
                await connection.close();
            } catch (error) {
                console.error('Erreur lors de la fermeture de la connexion :', error);
            }
        }
    }
}

async function updateProduct(p_idProduct, p_name, p_quantity, p_price) {
    let connection;

    try {
        // Établir une connexion à la base de données Oracle
        connection = await oracledb.getConnection({
            user: 'sys',
            password: 'sys',
            connectString: 'localhost:1521/FREE',
            privilege: oracledb.SYSDBA
        });


        // Appeler la procédure PL/SQL pour mettre à jour le produit
        await connection.execute(
            `BEGIN
                update_product(:p_idProduct, :p_name, :p_quantity, :p_price);
            END;`,
            {
                p_idProduct: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: p_idProduct },
                p_name: { dir: oracledb.BIND_IN, type: oracledb.STRING, val: p_name },
                p_quantity: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: p_quantity },
                p_price: { dir: oracledb.BIND_IN, type: oracledb.NUMBER, val: p_price }
            }
        );

        console.log('Produit mis à jour avec succès.');
    } catch (error) {
        console.error('Erreur lors de la mise à jour du produit :', error);
        throw error;
    } finally {
        if (connection) {
            try {
                // Fermer la connexion
                await connection.close();
            } catch (error) {
                console.error('Erreur lors de la fermeture de la connexion :', error);
            }
        }
    }}

async function searchProducts(searchKeyword, maxPrice, minQuantity, categoryId) {
        let connection;
    
        try {
            // Établir une connexion à la base de données Oracle
            connection = await oracledb.getConnection({
                user: 'sys',
                password: 'sys',
                connectString: 'localhost:1521/FREE',
                privilege: oracledb.SYSDBA
            });
    
            // Appeler la fonction PL/SQL et récupérer les résultats
            const result = await connection.execute(
                `BEGIN
                    :cursor := SearchProducts(:searchKeyword, :maxPrice, :minQuantity, :categoryId);
                END;`,
                {
                    cursor: { type: oracledb.CURSOR, dir: oracledb.BIND_OUT },
                    searchKeyword: searchKeyword,
                    maxPrice: maxPrice,
                    minQuantity: minQuantity,
                    categoryId: categoryId
                }
            );
    
            // Lire les résultats du curseur
            const resultSet = result.outBinds.cursor;
            let rows = [];
            let row;
    
            while ((row = await resultSet.getRow())) {
                rows.push(row);
            }
    
            // Fermer le curseur
            await resultSet.close();
    
            return rows;
        } catch (error) {
            console.error('Erreur lors de l\'appel de la fonction PL/SQL :', error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (error) {
                    console.error('Erreur lors de la fermeture de la connexion :', error);
                }
            }
        }
    }
        
    async function addProduct(nameProduct, quantity, price, categoryList) {
        let connection;
    
        try {
            // Établir une connexion à la base de données Oracle
            connection = await oracledb.getConnection({
                user: 'sys',
                password: 'sys',
                connectString: 'localhost:1521/FREE',
                privilege: oracledb.SYSDBA
            });
    
            // Appeler la procédure stockée PL/SQL
            await connection.execute(
                `BEGIN
                    AddProduct(:p_nameProduct, :p_quantity, :p_price, :p_categoryList);
                END;`,
                {
                    p_nameProduct: nameProduct,
                    p_quantity: { type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: quantity },
                    p_price: { type: oracledb.NUMBER, dir: oracledb.BIND_IN, val: price },
                    p_categoryList: { type: oracledb.NUMBER_ARRAY, dir: oracledb.BIND_IN, val: categoryList }
                }
            );
    
            console.log('Produit ajouté avec succès.');
        } catch (error) {
            console.error('Erreur lors de l\'ajout du produit :', error);
            throw error;
        } finally {
            if (connection) {
                try {
                    await connection.close();
                } catch (error) {
                    console.error('Erreur lors de la fermeture de la connexion :', error);
                }
            }
        }
    }
    
    
export {searchProducts, getProductReviewsUser ,getProductReviews, getCategories, getProducts, getProductDetailsById , getTopProducts , get_most_reviewed_products , get_highest_rated_products , get_categories_with_most_products , get_Most_Expensive_ordered_products , calculate_total_stock_value, addProduct, deleteProduct , updateProduct, getProductsCount};
