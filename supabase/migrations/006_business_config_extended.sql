-- Extension de la table business_config avec les clés manquantes pour le dashboard paramètres

INSERT INTO business_config (key, value, description) VALUES
  ('company_email',       '"contact@globalticgroup.com"',   'Email principal de l''entreprise'),
  ('company_phone',       '"+221 77 619 04 19"',            'Téléphone principal de l''entreprise'),
  ('company_address',     '"Dakar, Sénégal"',               'Adresse de l''entreprise'),
  ('company_tagline',     '"Imprimerie Professionnelle"',   'Slogan ou activité principale'),
  ('company_website',     '"https://imprimerie.globalticgroup.com"', 'Site web de l''entreprise'),
  ('default_deposit_percent', '50',                         'Acompte par défaut en % (ex: 50 = 50%)'),
  ('pdf_conditions',      '["Les modalités de paiement sont les suivantes : 50 % d''acompte à la validation de la commande, le solde restant étant payable à la livraison.", "Ce devis est établi sur la base des informations transmises et reste valable pour la durée indiquée.", "Tout délai de production court à compter de la réception de l''acompte et de la validation du BAT.", "GLOBAL TIC se réserve le droit de refuser toute commande dont le contenu serait contraire aux lois en vigueur."]', 'Conditions générales affichées dans le PDF devis'),
  ('pdf_footer_text',     '"GLOBAL TIC — Imprimerie Professionnelle — Dakar, Sénégal"', 'Pied de page des PDF'),
  ('pdf_payment_terms',   '"50% d''acompte à la commande, solde à la livraison"', 'Conditions de paiement affichées dans les devis'),
  ('wa_template_devis',   '"Bonjour *{client}*,\n\nSuite à notre échange, voici le récapitulatif de votre devis :\n\n*Référence* : {reference}\n*Total estimatif* : {total} FCFA\n\nConfirmez-vous cette commande ? Nous pouvons démarrer la production dès validation.\n\n*GLOBAL TIC*"', 'Modèle message WhatsApp — envoi devis'),
  ('wa_template_confirmation', '"Bonjour *{client}*,\n\nNous avons bien enregistré votre commande.\n\n*Référence commande* : {reference}\n*Montant total* : {total} FCFA\n\nNotre équipe vous contactera prochainement pour les prochaines étapes.\n\nMerci pour votre confiance — *GLOBAL TIC*"', 'Modèle message WhatsApp — confirmation commande'),
  ('wa_template_pret',    '"Bonjour *{client}*,\n\nVotre commande *{reference}* est prête à être livrée ✅\n\nNotre livreur vous contactera pour organiser la livraison.\n\n*GLOBAL TIC*"', 'Modèle message WhatsApp — commande prête'),
  ('wa_template_livraison', '"Bonjour *{client}*,\n\nVotre commande *{reference}* est en cours de livraison.\nNotre livreur vous contactera pour convenir de l''heure de remise.\n\n*GLOBAL TIC*"', 'Modèle message WhatsApp — en livraison'),
  ('wa_template_livre',   '"Bonjour *{client}*,\n\nVotre commande *{reference}* a bien été livrée.\nNous espérons que tout est à votre satisfaction.\n\nMerci de votre confiance — *GLOBAL TIC*"', 'Modèle message WhatsApp — livraison confirmée'),
  ('wa_template_paiement', '"Bonjour *{client}*,\n\nNous vous confirmons la réception de votre paiement de *{montant} FCFA* pour la commande *{reference}*.\n\nMerci pour votre confiance.\n\n*GLOBAL TIC*"', 'Modèle message WhatsApp — paiement reçu'),
  ('wa_template_bat',     '"Bonjour *{client}*,\n\nVotre commande *{reference}* est en cours de préparation du BAT.\nVous recevrez prochainement un fichier de validation à approuver avant l''impression.\n\n*GLOBAL TIC*"', 'Modèle message WhatsApp — BAT envoyé')
ON CONFLICT (key) DO NOTHING;
