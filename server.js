const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');
var cors = require('cors');
const { error } = require('console');

 


const app = express();
const PORT = process.env.PORT || 5500;
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/campuseats', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Define user schema
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    password: String,
    name: String,
    phone: String,
    role: { type: String, enum: ['customer', 'seller'] } // Add role field
});

// Define order schema
const orderSchema = new mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId, // Add _id field to store ObjectId
  user: String,
  restaurant: String,
  items: [{
      menuItem: String,
      quantity: Number,
      price: Number
  }],
  totalPrice: Number,
  status: { type: String, enum: ['pending', 'rejected', 'in-process', 'completed'], default: 'pending' } // Add default value
});



// Define menu item schema
const menuSchema = new mongoose.Schema({
    name: String,
    price: Number,
});

// Define restaurant schema
const restaurantSchema = new mongoose.Schema({
    name: String,
    // Other restaurant fields
    menu: [menuSchema], // Embed menu schema as a subdocument array
    orders : [orderSchema] // Reference to the Order model for
});



// Define models
const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);
const MenuItem = mongoose.model('MenuItem', menuSchema);
const Restaurant = mongoose.model('Restaurant', restaurantSchema);


// Function to create a new restaurant instance with dummy data and save it to the database
// const createRestaurant = async () => {
//   try {
//       // Create a new restaurant instance with dummy data
//       const newRestaurant = new Restaurant({
//           name: 'nidhisha',
//           orders: [// Add more orders as needed
//           ]
//       });

//        // Save the restaurant instance to the database
//        await newRestaurant.save();
//        console.log('Restaurant created successfully:', newRestaurant);
//    } catch (error) {
//        console.error('Error creating restaurant:', error);
//    }
// };

// //Call the function to create a new restaurant instance
// createRestaurant();

// // Save the new restaurant instance to the database
// newRestaurant.save()
//   .then(restaurant => {
//       console.log("Restaurant created successfully:", restaurant);
//   })
//   .catch(error => {
//       console.error("Error creating restaurant:", error);
//   });

// Middleware to parse JSON bodies
//app.use(express.json());
app.use(bodyParser.json());

// app.get('/',async (req,res)=>{
//     res.send("<h1>Hello World!</h1>");
// });

// Route to handle sign-up
app.post('/signup', async (req, res) => {
    const { username, password, name, phone, role = "customer" } = req.body;
    try {
        if (!username || !role) { // Check if username and role are provided
            return res.status(400).send('Username and role are required');
        }
        // Check that the username is not already in use
        let existingUser = await User.findOne({ username: username });
        if (existingUser) {
            return res.status(400).send('Username is already taken');
        }

        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, name, phone, role }); // Include role in user object
        await user.save()
            .then((user) => { res.status(201).send(user) })
            .catch((e) => { console.log("ERROR IN SAVING USER", e) });
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
});

app.get('/edit_menu', (req, res) => {
  // Construct the file path to the edit_menu.html file
  const filePath = path.join(__dirname, 'edit_menu.html');

  // Send the edit_menu.html file
  res.sendFile(filePath);
});

//Checkout
app.get('/checkout', (req, res) => {
  // Construct the file path to the edit_menu.html file
  const filePath = path.join(__dirname, 'checkout.html');

  // Send the edit_menu.html file
  res.sendFile(filePath);
});

//Checkout
app.get('/dashboard', (req, res) => {
  // Construct the file path to the edit_menu.html file
  const filePath = path.join(__dirname, 'dashboard.html');

  // Send the edit_menu.html file
  res.sendFile(filePath);
});


app.get('/status', (req, res) => {
  // Construct the file path to the edit_menu.html file
  const filePath = path.join(__dirname, 'Status.html');

  // Send the edit_menu.html file
  res.sendFile(filePath);
});

app.get('/login', (req, res) => {
  // Construct the file path to the edit_menu.html file
  const filePath = path.join(__dirname, 'login.html');

  // Send the edit_menu.html file
  res.sendFile(filePath);
});

app.get('/signup', (req, res) => {
  // Construct the file path to the edit_menu.html file
  const filePath = path.join(__dirname, 'signup.html');

  // Send the edit_menu.html file
  res.sendFile(filePath);
});

app.get('/menu', (req, res) => {
  // Construct the file path to the edit_menu.html file
  const filePath = path.join(__dirname, 'menuu.html');

  // Send the edit_menu.html file
  res.sendFile(filePath);
});
//         // Hash the password
//        // const saltRounds = 10;
//         const hpassword = bcrypt.hashSync(password, 10); // Generate hash with salt rounds
//         // Create a new user record with the hashed password
//         const user = new User({ username, password:hpassword, name, phone });
//         // Save the user record to the database
//         await user.save();
//         res.status(201).send('User created successfully');
//     } catch (error) {
//         console.error('Error signing up:', error);
//         res.status(500).send('Error signing up');
//     }
// });
app.get('/home', (req, res) => {
    // Redirect to home.html
    res.sendFile(path.join(__dirname, 'home.html'));
  });
  
// Route to handle login
app.post('/login', async (req, res) => {
    const { username, password, role } = req.body;
    try {
        if (!username || !role) {
            return res.status(400).send('Username and role are required');
        }

        // Find the user by username
        const user = await User.findOne({ username });

        // Check if user exists
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            // Check if the role matches
            if (user.role === role) {
                // Send role in response if login successful
                return res.status(201).send({ message: 'Login successful', role: user.role });
            } else {
                // Role doesn't match
                return res.status(401).send('Role does not match');
            }
        } else {
            return res.status(401).send('Invalid password');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Error logging in');
    }
});

// Routes to fetch menu
// app.get('/menu/:username', async (req, res) => {
//   try {
//     const username = req.params.username;
//     const menuItems = await MenuItem.find({ restaurant: username });
//     res.json(menuItems);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

app.get('/menu/:resturant', async (req, res) => {
  try {
    const name = req.params.resturant;
    // Find the restaurant document by username
    const restaurant = await Restaurant.findOne({ name: name });

    // Check if the restaurant exists
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Extract the menu items from the restaurant document
    const menuItems = restaurant.menu;

    // Send the menu items as the response
    res.json(menuItems);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

  
  app.post('/menu', async (req, res) => {
    try {
      const { name, price } = req.body;
  
      // Get the username from the query parameters
      const { username } = req.query;
  
      // Find the restaurant by username
      const restaurant = await Restaurant.findOne({ name: username });
  
      // Check if the restaurant exists
      if (!restaurant) {
        return res.status(404).json({ error: 'Restaurant not found' });
      }
  
      // Create a new menu item and add it to the restaurant's menu
      const newItem = new MenuItem({ name, price });
      restaurant.menu.push(newItem);
      await restaurant.save();
  
      res.status(201).json(newItem);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  


  
//   // Update a menu item
//   app.put('/api/menu/:itemId', async (req, res) => {
//     try {
//       const itemId = req.params.itemId;
//       const { name, price } = req.body;
//       const updatedItem = await MenuItem.findByIdAndUpdate(itemId, { name, price }, { new: true });
//       res.json(updatedItem);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   });

//Delete item
app.delete('/menu/:restaurant/:itemId', async (req, res) => {
  try {
    const { restaurant, itemId } = req.params;

    // Find the restaurant by its name
    const foundRestaurant = await Restaurant.findOne({ name: restaurant });

    if (!foundRestaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Remove the item from the menu array
    foundRestaurant.menu = foundRestaurant.menu.filter(item => item._id.toString() !== itemId);

    // Save the updated restaurant document
    await foundRestaurant.save();

    res.status(200).json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//Fetch the orders
app.get('/orders/:username', async (req, res) => {
  try {
      const username = req.params.username;

      // Find the restaurant by username
      const restaurant = await Restaurant.findOne({ name: username });

      if (!restaurant) {
          return res.status(404).json({ error: 'Restaurant not found' });
      }

      // Retrieve orders of the restaurant
      const orders = restaurant.orders;

      res.json({ orders });
  } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

//Route to update the status of an order associated with a specific restaurant
app.put('/orders/:username/:orderId/status', async (req, res) => {
  try {
      const username = req.params.username;
      const orderId = req.params.orderId;
      const { status } = req.body;

      // Find the restaurant by username
      const restaurant = await Restaurant.findOne({ name: username });

      if (!restaurant) {
          return res.status(404).json({ error: 'Restaurant not found' });
      }

      // Find the order by orderId and update its status
      const updatedOrder = await Order.findOneAndUpdate(
          { _id: orderId},
          { status },
          { new: true }
      );

      if (!updatedOrder) {
          return res.status(404).json({ error: 'Order not found' });
      }

      // Update the order status in the restaurant's orders array
      const restaurantOrderIndex = restaurant.orders.findIndex(order => order._id.toString() === orderId);
      if (restaurantOrderIndex !== -1) {
          restaurant.orders[restaurantOrderIndex].status = status;
          await restaurant.save();
      }

      res.json(updatedOrder);
  } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to delete an order
app.delete('/orders/:orderId/:username', async (req, res) => {
  try {
      const orderId = req.params.orderId;
      const username = req.params.username;

      // Find the restaurant associated with the username
      const restaurant = await Restaurant.findOne({ name: username });

      if (!restaurant) {
          return res.status(404).json({ error: 'Restaurant not found' });
      }

      // Find the index of the order to be deleted in the restaurant's orders array
      const orderIndex = restaurant.orders.findIndex(order => order._id.toString() === orderId);

      if (orderIndex === -1) {
          return res.status(404).json({ error: 'Order not found in restaurant' });
      }

      // Remove the order from the restaurant's orders array
      restaurant.orders.splice(orderIndex, 1);
      await restaurant.save();

      res.json({ message: 'Order deleted successfully' });
  } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/place-order', async (req, res) => {
  try {
      // Extract order details from request body
      const { restaurantName, user, items, totalPrice } = req.body;

      // Find the restaurant by name
      const restaurant = await Restaurant.findOne({ name: restaurantName });

      // Create a new order
      const order = new Order({
          user,
          items,
          totalPrice,
          restaurant: restaurant.name,// Reference to the restaurant
      });

      // Save the order
      await order.save();

      // Add the order to the restaurant's orders array
      restaurant.orders.push(order);
      await restaurant.save();

      res.status(200).json({ message: 'Order placed successfully', order });
  } catch (error) {
      console.error('Error placing order:', error);
      res.status(500).json({ error: 'Failed to place order' });
  }
});

// Route to fetch order status based on orderId
app.get('/order/status', async (req, res) => {
  try {
    const { orderId } = req.query;

    // Validate orderId as a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ error: 'Invalid orderId' });
    }

    // Find the order by orderId
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Return the order status
    res.json({ status: order.status });
  } catch (error) {
    console.error('Error fetching order status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Route to fetch order data based on restaurant name and username
app.get('/orders', async (req, res) => {
  try {
    const { username, resturant } = req.query;

    // Find the restaurant by name
    const foundRestaurant = await Restaurant.findOne({ name: resturant });

    if (!foundRestaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Retrieve orders of the restaurant for the specified username
    const orders = await Order.find({ user: username });

    res.json(orders );
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
