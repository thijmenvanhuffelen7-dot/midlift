// First drafts of the privacy policy and terms. Have them checked before publishing,
// and fill in the [placeholders]. Update them when accounts (Supabase), payments
// (RevenueCat) or analytics (PostHog) go live.

export type LegalDoc = { title: string; updated: string; sections: { h: string; p: string }[] };

const CONTACT_NL = '[naam of bedrijfsnaam], [adres], [e-mailadres]';
const CONTACT_EN = '[name or company name], [address], [email address]';

export const LEGAL: Record<'nl' | 'en', Record<'privacy' | 'terms', LegalDoc>> = {
  nl: {
    privacy: {
      title: 'Privacyverklaring',
      updated: 'Concept, versie 29 oktober 2026',
      sections: [
        { h: 'Wie zijn wij', p: `Midlift wordt aangeboden door ${CONTACT_NL}. Heb je vragen over je gegevens? Mail ons op het adres hierboven.` },
        {
          h: 'Welke gegevens we gebruiken',
          p: 'Je antwoorden uit de intake (zoals leeftijd, lengte, gewicht, ervaring, klachten en doel), je trainingen, je check-ins en wat je eet. Een deel hiervan gaat over je gezondheid. We gebruiken deze gegevens alleen om je trainingen en voedingsdoelen te maken en aan te passen.',
        },
        {
          h: 'Waar je gegevens staan',
          p: 'In deze versie van de app staan al je gegevens alleen op je eigen telefoon. Ze worden niet naar onze servers gestuurd. Als je de app verwijdert, zijn ze weg.',
        },
        {
          h: 'Producten zoeken',
          p: 'Als je een product zoekt, sturen we je zoekwoord naar Open Food Facts, een open database met voedingswaarden. Er gaan geen andere gegevens van jou mee.',
        },
        {
          h: 'Abonnementen',
          p: 'Betalingen lopen via de App Store van Apple of Google Play. Zij verwerken je betaalgegevens; wij zien die niet. Wij krijgen alleen te horen of je abonnement actief is.',
        },
        { h: 'Je rechten', p: 'Je mag je gegevens inzien, laten aanpassen of laten verwijderen. Neem daarvoor contact met ons op. Je kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens.' },
        { h: 'Wijzigingen', p: 'Als we iets veranderen aan hoe we met je gegevens omgaan, bijvoorbeeld wanneer je kunt inloggen, passen we deze verklaring aan en laten we dat in de app weten.' },
      ],
    },
    terms: {
      title: 'Algemene voorwaarden',
      updated: 'Concept, versie 29 oktober 2026',
      sections: [
        { h: 'Over Midlift', p: `Midlift is een app met krachttraining en voedingsbegeleiding, aangeboden door ${CONTACT_NL}.` },
        {
          h: 'Geen medisch advies',
          p: 'Midlift geeft algemene begeleiding en vervangt geen arts, fysiotherapeut of diëtist. Heb je klachten, een aandoening of twijfel? Overleg eerst met je huisarts. Stop met een oefening als die pijn doet.',
        },
        {
          h: 'Abonnement en proefperiode',
          p: 'Midlift Premium is een abonnement per maand of per jaar, met 7 dagen gratis proberen. Na de proefperiode wordt het abonnement automatisch betaald en verlengd, tenzij je het uiterlijk 24 uur voor het einde van de periode opzegt.',
        },
        { h: 'Opzeggen en terugbetalen', p: 'Opzeggen doe je in de instellingen van je App Store- of Google Play-account. Terugbetalingen lopen via Apple of Google, volgens hun regels.' },
        { h: 'Gebruik', p: 'Je gebruikt Midlift voor jezelf en niet voor commerciële doeleinden. Je mag de app niet kopiëren of misbruiken.' },
        {
          h: 'Aansprakelijkheid',
          p: 'We doen ons best om Midlift goed en veilig te maken, maar je traint op eigen verantwoordelijkheid. Voor zover de wet dat toestaat, zijn we niet aansprakelijk voor blessures of schade door het gebruik van de app.',
        },
        { h: 'Recht', p: 'Op deze voorwaarden is Nederlands recht van toepassing.' },
      ],
    },
  },
  en: {
    privacy: {
      title: 'Privacy policy',
      updated: 'Draft, version 29 October 2026',
      sections: [
        { h: 'Who we are', p: `Midlift is provided by ${CONTACT_EN}. Questions about your data? Email us at the address above.` },
        {
          h: 'What data we use',
          p: 'Your intake answers (such as age, height, weight, experience, complaints and goal), your workouts, your check-ins and what you eat. Some of this is about your health. We only use it to create and adjust your workouts and nutrition goals.',
        },
        { h: 'Where your data is', p: 'In this version of the app, all your data stays on your own phone. It is not sent to our servers. If you delete the app, it is gone.' },
        { h: 'Searching for products', p: 'When you search for a product, we send your search words to Open Food Facts, an open database of nutrition values. No other data about you is sent.' },
        { h: 'Subscriptions', p: 'Payments are handled by the Apple App Store or Google Play. They process your payment details; we never see them. We only learn whether your subscription is active.' },
        { h: 'Your rights', p: 'You can ask to see, correct or delete your data by contacting us. You can also complain to your data protection authority.' },
        { h: 'Changes', p: 'If we change how we handle your data, for example when you can log in, we will update this policy and tell you in the app.' },
      ],
    },
    terms: {
      title: 'Terms of use',
      updated: 'Draft, version 29 October 2026',
      sections: [
        { h: 'About Midlift', p: `Midlift is a strength training and nutrition app provided by ${CONTACT_EN}.` },
        {
          h: 'Not medical advice',
          p: 'Midlift gives general guidance and does not replace a doctor, physiotherapist or dietitian. If you have complaints, a condition or doubts, talk to your doctor first. Stop an exercise if it hurts.',
        },
        {
          h: 'Subscription and free trial',
          p: 'Midlift Premium is a monthly or yearly subscription with a 7-day free trial. After the trial, the subscription is charged and renews automatically unless you cancel at least 24 hours before the end of the period.',
        },
        { h: 'Cancelling and refunds', p: 'Cancel in the settings of your App Store or Google Play account. Refunds are handled by Apple or Google under their rules.' },
        { h: 'Use', p: 'You use Midlift for yourself and not for commercial purposes. Do not copy or misuse the app.' },
        { h: 'Liability', p: 'We do our best to make Midlift good and safe, but you train at your own risk. To the extent the law allows, we are not liable for injuries or damage from using the app.' },
        { h: 'Law', p: 'These terms are governed by Dutch law.' },
      ],
    },
  },
};
