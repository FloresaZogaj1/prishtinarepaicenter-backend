const mongoose = require('mongoose');

const HomePageContentSchema = new mongoose.Schema({
  hero: {
    kicker: { type: String },
    headline: { type: String },
    subHeadline: { type: String },
    sub: { type: String },
    bullets: { type: [String], default: [] },
    media: { type: String },
    poster: { type: String },
  },
  servicesIntro: {
    title: { type: String },
    subtitle: { type: String },
  },
  services: {
    item1: { title: { type: String }, desc: { type: String }, image: { type: String } },
    item2: { title: { type: String }, desc: { type: String }, image: { type: String } },
    item3: { title: { type: String }, desc: { type: String }, image: { type: String } },
    item4: { title: { type: String }, desc: { type: String }, image: { type: String } },
  },
  process: {
    kicker: { type: String },
    title: { type: String },
    intro: { type: String },
    step1: { title: { type: String }, description: { type: String } },
    step2: { title: { type: String }, description: { type: String } },
    step3: { title: { type: String }, description: { type: String } },
    step4: { title: { type: String }, description: { type: String } },
  },
  processSteps: {
    step1: { type: Object, default: {} },
    step2: { type: Object, default: {} },
    step3: { type: Object, default: {} },
    step4: { type: Object, default: {} },
  },
  whyCards: {
    card1: { type: Object, default: {} },
    card2: { type: Object, default: {} },
    card3: { type: Object, default: {} },
    card4: { type: Object, default: {} },
  },
  whySection: {
    kicker: { type: String },
    title: { type: String },
    intro: { type: String },
  },
  faqs: {
    faq1: { type: Object, default: {} },
    faq2: { type: Object, default: {} },
    faq3: { type: Object, default: {} },
    faq4: { type: Object, default: {} },
  },
  faqsSection: {
    kicker: { type: String },
    title: { type: String },
    intro: { type: String },
  },
  contactSummary: {
    address: { type: String },
    phoneDisplay: { type: String },
    phoneIntl: { type: String },
    email: { type: String },
    maps: { type: String },
  },
  contactSection: {
    kicker: { type: String },
    title: { type: String },
    intro: { type: String },
  },
  footerText: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

HomePageContentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('HomePageContent', HomePageContentSchema);
