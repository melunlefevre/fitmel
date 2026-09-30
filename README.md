# FITMEL

Site avec accompagnement (49 €/1 mois ou 147 €/3 mois), ebook interactif à 25 € et calculateur gratuit.

## Activer la vente de l’ebook sur Vercel ou Netlify

Le dépôt contient `netlify.toml` : build `node scripts/build.mjs`, publication `dist`, fonctions `netlify/functions`.

Sur Vercel : Project Settings → Environment Variables. Ajouter `SITE_URL=https://fitmel.vercel.app`, `STRIPE_SECRET_KEY` et `FITMEL_EBOOK_KEY` en Production, puis redéployer. `vercel.json` publie uniquement `dist` et déclare les fonctions API.

Dans les variables d’environnement Netlify, ajouter `STRIPE_SECRET_KEY` (clé secrète Stripe, disponible pour les Functions). Ne jamais mettre cette clé dans le HTML ou dans GitHub. La variable `URL` est fournie par Netlify ; définir `SITE_URL` si une autre URL canonique est nécessaire.

Ajouter également `FITMEL_EBOOK_KEY`, fournie dans le fichier de configuration privé. Le contenu est chiffré avec AES-256-GCM et déchiffré uniquement côté serveur après vérification du paiement.

Redéployer après modification des variables. Tester avec une clé Stripe de test et un paiement de test, puis remplacer par la clé live et redéployer pour ouvrir les ventes. Les liens Stripe des accompagnements restent ceux du site initial.

Le bouton ebook crée une session Stripe de 25 €. `/ebook?session_id=...` vérifie côté serveur le paiement, le montant, la devise et l’offre avant de livrer le contenu. Sans configuration, le bouton affiche que le paiement sera bientôt disponible. Le client doit enregistrer son lien ; aucune livraison automatique par email n’est implémentée. Un remboursement n’invalide pas encore le lien. Le calculateur conserve seulement le profil dans le navigateur.

Le dépôt ne contient que le contenu chiffré de l’ebook. Ne jamais publier sa clé ni sa version HTML. Le lien d’accès fonctionne comme un lien personnel partageable ; il n’y a pas de compte client.
