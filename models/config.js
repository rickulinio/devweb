const mongoose = require('mongoose');

// Definiujemy schemat dla konfiguracji
// Używamy Mixed, aby móc przechowywać dowolną strukturę danych (pytania, regulamin itp.)
const configSchema = new mongoose.Schema({
    type: { 
        type: String, 
        required: true, 
        unique: true 
    }, // Typ konfiguracji: np. 'factions', 'rules', 'permissions'
    data: { 
        type: mongoose.Schema.Types.Mixed, 
        required: true 
    }
});

module.exports = mongoose.model('Config', configSchema);