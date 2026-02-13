// script.js – gestisce l’interazione con Supabase e i moduli del sito

// Inserisci qui le variabili del tuo progetto Supabase. Queste verranno
// sostituite nelle impostazioni di deploy su Vercel con i valori reali.
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// Crea il client Supabase se le variabili sono definite
let supabaseClient = null;
if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Carica l’elenco dei servizi dalla tabella `servizi` e popola la pagina.
 */
async function loadServices() {
  if (!supabaseClient) return;
  const listContainer = document.getElementById('services-list');
  if (!listContainer) return;
  try {
    const { data, error } = await supabaseClient.from('servizi').select('*');
    if (error) {
      console.error('Errore nel recupero dei servizi', error);
      listContainer.innerHTML = '<p>Impossibile caricare i servizi in questo momento.</p>';
      return;
    }
    listContainer.innerHTML = '';
    data.forEach((servizio) => {
      const card = document.createElement('div');
      card.className = 'service-card';
      card.innerHTML = `
        <h3>${servizio.nome}</h3>
        <p>${servizio.descrizione || ''}</p>
        <p><strong>Prezzo:</strong> €${servizio.prezzo ?? 'n/d'}</p>
      `;
      listContainer.appendChild(card);
    });
  } catch (err) {
    console.error('Eccezione nella lettura dei servizi', err);
    listContainer.innerHTML = '<p>Si è verificato un errore inatteso.</p>';
  }
}

/**
 * Gestisce l’invio del modulo di contatto inserendo un record nella tabella
 * `contatti`.
 */
async function handleContactSubmit(event) {
  event.preventDefault();
  if (!supabaseClient) return;
  const alertDiv = document.getElementById('contact-alert');
  const form = event.target;
  const nome = form.nome.value.trim();
  const email = form.email.value.trim();
  const messaggio = form.messaggio.value.trim();
  try {
    const { error } = await supabaseClient.from('contatti').insert({
      nome,
      email,
      messaggio,
    });
    if (error) {
      alertDiv.innerHTML = `<div class="alert error">Errore: ${error.message}</div>`;
      return;
    }
    alertDiv.innerHTML = '<div class="alert success">Messaggio inviato! Vi contatteremo al più presto.</div>';
    form.reset();
  } catch (err) {
    alertDiv.innerHTML = '<div class="alert error">Si è verificato un errore inatteso.</div>';
  }
}

/**
 * Gestisce la registrazione di un nuovo utente mediante Supabase Auth.
 * Inserisce anche l’utente nella tabella `utenti` con nome e cognome.
 */
async function handleSignup(event) {
  event.preventDefault();
  if (!supabaseClient) return;
  const alertDiv = document.getElementById('signup-alert');
  const form = event.target;
  const nome = form.nome.value.trim();
  const cognome = form.cognome.value.trim();
  const email = form.email.value.trim();
  const password = form.password.value;
  try {
    const { data: signUpData, error: signUpError } = await supabaseClient.auth.signUp({
      email,
      password,
    });
    if (signUpError) {
      alertDiv.innerHTML = `<div class="alert error">Errore: ${signUpError.message}</div>`;
      return;
    }
    // opzionalmente inserisci dati extra nella tabella utenti usando RPC o RLS
    alertDiv.innerHTML = '<div class="alert success">Registrazione completata! Controlla la tua email per confermare l’account.</div>';
    form.reset();
  } catch (err) {
    alertDiv.innerHTML = '<div class="alert error">Si è verificato un errore inatteso.</div>';
  }
}

/**
 * Gestisce l’accesso tramite email e password.
 */
async function handleLogin(event) {
  event.preventDefault();
  if (!supabaseClient) return;
  const alertDiv = document.getElementById('login-alert');
  const form = event.target;
  const email = form.email.value.trim();
  const password = form.password.value;
  try {
    const { data: sessionData, error: loginError } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });
    if (loginError) {
      alertDiv.innerHTML = `<div class="alert error">Errore: ${loginError.message}</div>`;
      return;
    }
    alertDiv.innerHTML = '<div class="alert success">Login effettuato con successo!</div>';
    // ridireziona alla home dopo login
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  } catch (err) {
    alertDiv.innerHTML = '<div class="alert error">Si è verificato un errore inatteso.</div>';
  }
}

// Associa i gestori agli eventi quando il DOM è pronto
document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactSubmit);
  }
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});