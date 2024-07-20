const Product = require("../models/Products");
const Cart = require("../models/Cart");

module.exports = {
  addToCart: async (req, res) => {
    const { userId, cartItem, quantity } = req.body;

    try {
      const cart = await Cart.findOne({ userId });
      if (cart) {
        const existingProduct = cart.products.find(
          (product) => product.cartItem.toString() === cartItem
        );

        if (existingProduct) {
          existingProduct.quantity += 1;
        } else {
          cart.products.push({ cartItem, quantity });
        }
        await cart.save();
        res.status(200).json("Product added to cart");
      } else {
        const newCart = new Cart({
          userId,
          products: [
            {
              cartItem,
              quantity: quantity,
            },
          ],
        });
        await newCart.save();
        res.status(200).json("Product added to cart");
      }
    } catch (error) {
      res.status(500).json(error);
    }
  },

  getCart: async (req, res) => {
    const userId = req.params.id;

    try {
      const cart = await Cart.find({ userId }).populate(
        "products.cartItem",
        "_id title supplier price imageUrl"
      );
      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  deleteCartItem: async (req, res) => {
    const cartItemId = req.params.cartItemId;

    try {
      const updatedCart = await Cart.findOneAndUpdate(
        { "products._id": cartItemId },
        { $pull: { products: { _id: cartItemId } } },
        { new: true }
      );

      if (!updatedCart) {
        return res.status(404).json("Cart item not found");
      }
      res.status(200).json(updatedCart)
    } catch (error) {
      res.status(500).json(error);
    }
  },

  decrementCartItem: async (req, res) => {
    const { userId, cartItem } = req.body;

    try {
      const cart = await Cart.findOne({ userId });

      if (!cart) {
        return res.status(404).json("Cart not found");
      }

      const existingProduct = cart.products.find(
        (product) => product.cartItem.toString() === cartItem.toString()
      );

      // Add logging to debug
    //   console.log("User ID:", userId);
    //   console.log("Cart:", cart);
    //   console.log("Cart Item:", cartItem);
    //   console.log("Existing Product:", existingProduct);

      if (!existingProduct) {
        return res.status(404).json("Product not found");
      }

      if (existingProduct.quantity === 1) {
        cart.products = cart.products.filter(
          (product) => product.cartItem.toString() !== cartItem.toString()
        );
      } else {
        existingProduct.quantity -= 1;
      }

      await cart.save();
      res.status(200).json("Product quantity updated");
    } catch (error) {
      res.status(500).json(error);
    }
  },
};
