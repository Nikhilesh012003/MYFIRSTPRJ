const Listing = require("../models/listing.js");

//  INDEX ROUTE
module.exports.index = async (req, res) => {
  const { country, category } = req.query;
  let allListings;
  if (country) {
    allListings = await Listing.find({
      country: { $regex: new RegExp(country, "i") },
    });
  } else {
    allListings = await Listing.find({});
  }
  // Filtering by category (on top of country filter)
  if (category) {
    allListings = await Listing.find({
      ...((country && { country: { $regex: new RegExp(country, "i") } }) || {}),
      category,
    });
    // If no results for that category
    if (allListings.length === 0) {
      req.flash("error", `No listings found for "${category}" category.`);
    }
  }
  res.render("index.ejs", {
    allListings,
    country,
    category,
    messages: req.flash(),
  });
};

//NEW ROUTE
module.exports.renderNewForm = (req, res) => {
  res.render("new.ejs");
};
//          SHOW ROUTE
module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  console.log(listing);
  res.render("show.ejs", { listing });
};
// CREATE LISTING
module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing); // if (!req.body.listing) {
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  //   throw new ExpressError(400, "Send Valid Data For Listing");
  await newListing.save(); // }
  req.flash("success", "New Listing Created!"); //let{title,description,price,image,country,location} = req.body;
  res.redirect("/listings");
};
// EDIT LISTING
module.exports.editListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("edit.ejs", { listing, originalImageUrl });
};

//UPDATE LISTING
module.exports.updateListing = async (req, res) => {
  // if (!req.body.listing) {
  //   throw new ExpressError(400, "Send Valid Data For Listing");
  // }
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Updated Listing!");
  res.redirect(`/listings/${id}`);
};
// DELETE LISTING
module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success", " Listing Deleted!");
  console.log(deletedListing);
  res.redirect("/listings");
};
