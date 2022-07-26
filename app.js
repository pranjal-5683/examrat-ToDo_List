		// Requiring files
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const md5 = require("md5");

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

mongoose.connect("mongodb+srv://admin-Pranjal:admin123@todolist-cluster.ikcrfai.mongodb.net/todolistDB");   //DB Connection


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

const User = mongoose.model("User", usersSchema);


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
	const username = req.body.username;
	const password = md5(req.body.password);

	User.findOne({email: username}, function(err, foundUser){
		if(!err && foundUser && (foundUser.password === password) ){
			Name = foundUser.name;
			res.redirect("/list")
		} else {
			console.log(err);
		}
	})
});


		// Register page requests
app.route("/register")

.get(function(req, res){
	res.render("register");
})

.post(function(req, res){
	const newUser = new User({
		name: req.body.name,
		email: req.body.username,
		password: md5(req.body.password)
	})

	newUser.save(function(err){
		if(!err){
			res.redirect("/");
		} else {
			console.log(err)
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
	Name = "";
	res.redirect("/");
});


		// Port Connection
let port = process.env.PORT;
if(port == null || port == ""){
	port = 3000;
}

app.listen(port, function(){
	console.log("Server has started successfully.");
});