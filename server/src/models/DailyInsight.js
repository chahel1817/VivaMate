const mongoose = require('mongoose');

const dailyInsightSchema = new mongoose.Schema({
    date: { type: String, required: true }, // YYYY-MM-DD
    type: { type: String, required: true, enum: ['TIP', 'FACT'] },
    title: { type: String, required: true },
    content: { type: String, required: true },
    hash: { type: String, required: true }
}, { timestamps: true });

dailyInsightSchema.index({ date: 1, type: 1 }, { unique: true });
dailyInsightSchema.index({ hash: 1, type: 1 });

module.exports = mongoose.model('DailyInsight', dailyInsightSchema);
