// src/routes/webhook.ts
import express, { Response, Request, NextFunction } from 'express';
import twilio from 'twilio';
import Product from '../models/Product';
import Order from '../models/Order';
import Merchant from '../models/Merchant';

const router = express.Router();
router.use(express.urlencoded({ extended: true }));

router.post('/webhook/whatsapp', (req: Request, res: Response, next: NextFunction) => {
    const from = req.body.From?.replace('whatsapp:', '') || '';
    const message = req.body.Body || '';

    console.log('------ WhatsApp Message Received ------');
    console.log('From:', from);
    console.log('Message:', message);
    console.log('----------------------------------');

    const twiml = new twilio.twiml.MessagingResponse();

    Merchant.findOne({ whatsappNumber: req.body.To })
    .then(merchant => {
        console.log('Incoming To number:', req.body.To);
        console.log('Found merchant:', merchant);

            if (!merchant) {
                console.error('No merchant found in database');
                twiml.message('Service temporarily unavailable. Please try again later.');
                res.type('text/xml');
                res.send(twiml.toString());
                return;
            }

            if (message.toLowerCase() === 'menu') {
                Product.find({ merchantId: merchant._id, inStock: true })
                    .then(products => {
                        console.log('Found products:', products);

                        let menuText = 'Here is our menu:\n';
                        products.forEach((product, index) => {
                            menuText += `${index + 1}. ${product.name} - $${product.price}\n`;
                        });
                        menuText += '\nTo order, send the item number (e.g., "1")';

                        console.log('Menu text:', menuText);
                        
                        twiml.message(menuText);
                        res.type('text/xml');
                        res.send(twiml.toString());
                    })
                    .catch(next);
                return;
            } 
            
            if (/^[0-9]+$/.test(message)) {
                Product.find({ merchantId: merchant._id, inStock: true })
                    .then(products => {
                        const productIndex = parseInt(message) - 1;
                        
                        if (productIndex >= 0 && productIndex < products.length) {
                            const selectedProduct = products[productIndex];
                            
                            Order.create({
                                merchantId: merchant._id,
                                customerName: "WhatsApp Customer",
                                customerPhone: from,
                                items: [{
                                    productId: selectedProduct._id,
                                    name: selectedProduct.name,
                                    price: selectedProduct.price,
                                    quantity: 1
                                }],
                                total: selectedProduct.price,
                                status: 'pending'
                            })
                            .then(order => {
                                twiml.message(
                                    `Order confirmed!\n` +
                                    `Item: ${selectedProduct.name}\n` +
                                    `Price: $${selectedProduct.price}\n` +
                                    `Order ID: ${order._id}\n\n` +
                                    `We'll process your order shortly.`
                                );
                                res.type('text/xml');
                                res.send(twiml.toString());
                            })
                            .catch(next);
                        } else {
                            twiml.message('Invalid selection. Send "menu" to see available items.');
                            res.type('text/xml');
                            res.send(twiml.toString());
                        }
                    })
                    .catch(next);
                return;
            }

            twiml.message('Welcome! Send "menu" to see our available items.');
            res.type('text/xml');
            res.send(twiml.toString());
        })
        .catch(error => {
            console.error('Error:', error);
            twiml.message('Sorry, something went wrong. Please try again.');
            res.type('text/xml');
            res.send(twiml.toString());
        });
});

export default router;