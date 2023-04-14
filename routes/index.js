var express = require('express');
var router = express.Router();


const mongoose = require("mongoose");
const Commande = require("../commande/commande");
const axios = require('axios');
const isAuthenticated = require("../auth/isAuthenticated");
mongoose.set('strictQuery', true);
mongoose.connect(
  "mongodb+srv://DEVyounes:DEVyounes@cluster0.zrhgs6u.mongodb.net/commande?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
);
router.use(express.json());
function prixTotal(produits) {
  let total = 0;
  for (let t = 0; t < produits.length; ++t) {
    total += produits[t].prix;
  }
  console.log("prix total :" + total);
  return total;
}
async function httpRequest(ids, tok) {
  try {
    const URL = "https://ofppt-prod-service.azurewebsites.net/produit/acheter";
    const response = await axios.get(URL,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tok}`
        },
        data: {
          ids: ids
        }
      });
    return prixTotal(response.data);
  } catch (error) {
    console.error(error);
  }
}
router.post("/commande/ajouter", isAuthenticated,
  async (req, res, next) => {
    const { ids } = req.body;
    const token = req.headers['authorization']?.split(' ')[1];
    httpRequest(ids, token).then(total => {

      if (total > 0) {
        const newCommande = new Commande({
          produits: ids,
          email_utilisateur: req.user.email,
          prix_total: total,
        });
        newCommande.save()
          .then(commande => res.status(201).json(commande))
          .catch(error => res.status(400).json({ error }));
      }
      else {
        res.json({
          message: "error"
        });
      }

    });
  });

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Commande-service' });
});

module.exports = router;
