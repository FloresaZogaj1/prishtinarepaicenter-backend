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
    removed: { type: Boolean, default: false },
  },
  servicesIntro: {
    title: { type: String },
    subtitle: { type: String },
  },
  // services is now a dynamic array of cards. Each card has a stable `id` and editable fields.
  // For backward compatibility we still accept legacy objects with item1..item4 keys in the
  // routes layer and normalize them to this array shape.
  services: { type: [{ id: String, title: String, desc: String, image: String, link: String, imageRemoved: { type: Boolean, default: false } }], default: undefined },
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
  // recentWorks: persisted editable gallery. No default so we can distinguish
  // "never customised" (undefined) from "intentionally empty" ([]).
  recentWorks: { type: [{ id: String, src: String, alt: String }] },
  footerText: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

HomePageContentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('HomePageContent', HomePageContentSchema);
