const mongoose = require("mongoose");

const randomstring = require("randomstring");

const slugify = require('slugify');
let uniqueSlug = require("unique-slug");
let randomSlug = uniqueSlug();

const marked = require('marked');
const createDOMPurify = require("dompurify");
const { JSDOM } = require("jsdom");
const window = new JSDOM().window;
const DOMPurify = createDOMPurify(window);

const serviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    serviceTitle: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      required: true,
    },
    serviceTags: {
      type: Array,
      required: true,
    },
    pricing: {
      price: { type: Array, required: true },
      packageName: { type: Array, required: true },
      deliveryDay: { type: Array, required: true },
      description: { type: Array, required: true },
    },
    serviceDescription: {
      type: String,
      trim: true,
      required: true,
    },
    sanitizeServiceDescription: {
      type: String,
      trim: true,
      required: true,
    },
    thumbnailImage: {
      type: String,
      required: true,
    },
    order: {
      type: Array,
    },
    feedback: { type: Array },
  },
  { timestamps: true }
);

serviceSchema.pre('validate', function (next) {
    this.sanitizeServiceDescription = DOMPurify.sanitize(
        marked(this.serviceDescription)
    );
    next();
});

serviceSchema.methods.slugControl = async function (title) {
    let slug = slugify(title + "-" + randomstring.generate() + randomSlug + randomstring.generate(), {
      replacement: "-",
      lower: true,
      strict: true,
    });
    return slug;
};

const Service = mongoose.model("Service", serviceSchema);
module.exports = Service;