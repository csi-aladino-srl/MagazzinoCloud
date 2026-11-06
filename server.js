const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname)); // Serve il file warehouse.html

// Inizializza il file locale se non esiste
if (!fs.existsSync(DATA_FILE)) {
    const initialData = {
        lists: [{ id: 'list_1', name: 'Magazzino Principale', order: 0, announcements: [], createdAt: new Date().toISOString() }],
        products: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2), 'utf8');
}

// Helper per leggere/scrivere sul file locale JSON
function readData() {
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(raw);
    } catch (e) {
        return { lists: [], products: [] };
    }
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// API: Ottieni Liste e Prodotti
app.get('/api/data', (req, res) => {
    res.json(readData());
});

// API: Salva o Aggiorna Prodotto
app.post('/api/products', (req, res) => {
    const db = readData();
    const product = req.body;
    
    if (product.id) {
        const index = db.products.findIndex(p => p.id === product.id);
        if (index !== -1) {
            db.products[index] = { ...db.products[index], ...product, timestamp: new Date().toISOString() };
        }
    } else {
        product.id = 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        product.timestamp = new Date().toISOString();
        db.products.push(product);
    }
    
    saveData(db);
    res.json({ success: true, product });
});

// API: Operazioni di Massa / Modifiche Veloci
app.post('/api/products/bulk-update', (req, res) => {
    const db = readData();
    const { ids, updates } = req.body; // ids: array di ID, updates: oggetto con i campi da aggiornare
    
    db.products = db.products.map(p => {
        if (ids.includes(p.id)) {
            return { ...p, ...updates };
        }
        return p;
    });
    
    saveData(db);
    res.json({ success: true });
});

// API: Annulla modifiche di massa (Ripristina originali)
app.post('/api/products/bulk-reset', (req, res) => {
    const db = readData();
    const { ids } = req.body;
    
    db.products = db.products.map(p => {
        if (ids.includes(p.id)) {
            return {
                ...p,
                code: p.originalCode || p.code,
                location: p.originalLocation || p.location,
                brand: p.originalBrand !== undefined ? p.originalBrand : p.brand,
                stock: p.originalStock !== undefined && p.originalStock !== null ? p.originalStock : p.stock,
                description: p.originalDescription !== undefined ? p.originalDescription : p.description,
                note: p.originalNote !== undefined ? p.originalNote : p.note
            };
        }
        return p;
    });

    saveData(db);
    res.json({ success: true });
});

// API: Elimina Prodotto o Eliminazione di Massa
app.delete('/api/products', (req, res) => {
    const db = readData();
    const { ids } = req.body;
    db.products = db.products.filter(p => !ids.includes(p.id));
    saveData(db);
    res.json({ success: true });
});

// API: Importazione / Sovrascrittura Massiva Excel
app.post('/api/products/import', (req, res) => {
    const db = readData();
    const { newProducts, listId } = req.body;

    const prodMap = new Map();
    db.products.forEach(p => {
        if (p.listId === listId && p.code) {
            prodMap.set(p.code.toLowerCase().trim(), p);
        }
    });

    newProducts.forEach(item => {
        const codeKey = item.code ? item.code.toLowerCase().trim() : '';
        if (prodMap.has(codeKey)) {
            const existing = prodMap.get(codeKey);
            Object.assign(existing, item);
        } else {
            item.id = 'prod_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            db.products.push(item);
            prodMap.set(codeKey, item);
        }
    });

    saveData(db);
    res.json({ success: true });
});

// API: Gestione Liste
app.post('/api/lists', (req, res) => {
    const db = readData();
    const newList = {
        id: 'list_' + Date.now(),
        name: req.body.name,
        order: db.lists.length,
        announcements: [],
        createdAt: new Date().toISOString()
    };
    db.lists.push(newList);
    saveData(db);
    res.json({ success: true, list: newList });
});

app.put('/api/lists/:id', (req, res) => {
    const db = readData();
    const idx = db.lists.findIndex(l => l.id === req.params.id);
    if (idx !== -1) {
        db.lists[idx] = { ...db.lists[idx], ...req.body };
        saveData(db);
    }
    res.json({ success: true });
});

app.delete('/api/lists/:id', (req, res) => {
    const db = readData();
    db.lists = db.lists.filter(l => l.id !== req.params.id);
    db.products = db.products.filter(p => p.listId !== req.params.id);
    saveData(db);
    res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server Magazzino attivo su http://localhost:${PORT}`);
});