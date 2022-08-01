		// Requiring files
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

let today = new Date();
let options = {
	weekday: "long",
	day: "numeric",
	month: "long"
};
let day = today.toLocaleDateString("en-US", options)


app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
	secret: "Our little secret.",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


		//MongoDB Connection
mongoose.connect("mongodb+srv://admin-Pranjal:admin123@todolist-cluster.ikcrfai.mongodb.net/todolistDB");


		// Schema Definition
const itemsSchema = new mongoose.Schema({
	name: String
});

const Item = mongoose.model("Item", itemsSchema);

const usersSchema = new mongoose.Schema({
	name: String,
	email: String,
	password: String,
	items: [itemsSchema]
});

usersSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", usersSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

		// Default Items
const item1 = new Item({
	name: "Welcome to your todolist!"
});
const item2 = new Item({
	name: "Hit the + button to add a new item."
});
const item3 = new Item({
	name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

let Name;


		// GET & POST requests
app.get("/", function(req, res){
	res.render("home");
});


		// Login page requests
app.route("/login")

.get(function(req, res){
	res.render("login");
})

.post(function(req, res){
	const user = new User({
		username: req.body.username,
		password: req.body.password
	});
	req.login(user, function(err){
		if(err){
			console.log(err);
		} else{
			passport.authenticate("local")(req, res, function(){
				res.redirect("/list");
			});
		}
	})
});


		// Register page requests
app.route("/register")

.get(function(req, res){
	res.render("register");
})

.post(function(req, res){
	User.register({name: req.body.name, username: req.body.username}, req.body.password, function(err, user){
		if(err){
			console.log(err);
			res.redirect("/register");
		} else {
			passport.authenticate("local")(req, res, function(){
				res.redirect("/list");
			})
		}
	})
});


		// List page requests
app.route("/list")

.get(function(req, res){

	Item.find(function(err, foundItems){
		if(foundItems.length === 0){
			Item.insertMany( defaultItems, function(err){
				if(err)
					console.log(err)
				else
					console.log("Items added to the document")
			})
			res.redirect("/list");
		} else
			res.render("list", {userName: Name,listTitle: day, newListItems: foundItems});
		})
})

.post(function(req, res){

	const itemName = req.body.newItem;

	const item = new Item({
		name: itemName
	})

	item.save()
	res.redirect("/list")

});


		// Deleting item from list
app.post("/delete", function(req, res){
	const checkedItemId = req.body.checkbox;

	Item.findByIdAndRemove(checkedItemId, function(err){
		if(err) {
			console.log(err)
		} else{
			console.log("Successfully deleted")
			res.redirect("/list");
		}
	});

});


		// Logging out user
app.get("/logout", function(req, res){
		req.logout(function(err){
			if(err){
				console.log(err)
			} else {
				res.redirect("/");
			}
		});
})


		// Port Connection
let port = process.env.PORT;
if(port == null || port == ""){
	port = 3000;
}

app.listen(port, function(){
	console.log("Server has started successfully.");
});
