//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");
const { redirect } = require("express/lib/response");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser: true});

const itemsSchema = {
  name:String
};

const Item = mongoose.model("Item",itemsSchema)

const Item1 = new Item({
  name:"Welcome to your todoList!"
});

const Item2 = new Item({
  name: "Hit the + button to add new item."
});

const Item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [Item1,Item2,Item3];

const listSchema = {
  name:String,
  items:[itemsSchema]
};

const List  = mongoose.model("List",listSchema)



app.get("/", function(req, res) {
  Item.find({},function(err,foundItems){

    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
    if(err){
       console.log(err);
        }
  else{
    console.log("Successfully saved default items to DB.");
  }
})
    res.redirect("/");
    }
    else{

    res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })

});

app.get("/:customListName",function(req,res){
  const customListName = req.params.customListName;

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
       //create list
       const list = new List({
        name:customListName,
        item:defaultItems
      })
      list.save();
      res.redirect("/" + customListName)
      }
      else{
        //show existing list
        res.render("list",{listTitle: foundList.name,newListItems: foundList.items})
      }
    }
  })


})

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  })

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: list},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    })
  }

  item.save();
  res.redirect("/");
});



app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
 Item.findByIdAndRemove(checkedItemId,function(err){
   if(!err){
   console.log("deleted successfully");
   res.redirect("/");
   }
 })
})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
