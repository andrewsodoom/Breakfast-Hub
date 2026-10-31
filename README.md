# Breakfast Hub

A lightweight, responsive breakfast ordering and delivery website for a weekday breakfast service in Bogoso, Ghana. Customers browse breakfast combos, customize their order, add items to a bag, and place an order that is emailed directly to the business.

Built with plain HTML, CSS, and vanilla JavaScript — no build step or dependencies required.

## Features

- **Breakfast catalog** rendered dynamically from a JavaScript data array
- **Item customizer modal** with quantity stepper, optional add-ons, and special request notes
- **Slide-over cart drawer** with per-item quantity controls and live totals
- **Persistent cart and active order** via `localStorage`
- **Checkout flow** collecting delivery address, name, and phone number
- **Order delivery by email** through [FormSubmit](https://formsubmit.co) (no backend required)
- **Order confirmation modal** after a successful submission
- **Mobile-first responsive design** with a floating mobile cart bar
- Warm, breakfast-inspired design system driven by CSS custom properties

## Project Structure

```
Breakfast-Hub/
├── index.html        # Page markup: header, hero, catalog, cart, checkout modals, footer
├── styles.css        # Design tokens, layout, components, responsive rules
├── app.js            # Menu data, cart state, customization, checkout, email sending
├── assets/           # Product photos, logo, and hero artwork
└── README.md
```

## Getting Started

No installation or build tools are needed. Serve the folder with any static file server, or simply open `index.html` in a browser.

Using Python:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

> Opening `index.html` directly via `file://` also works, but the email submission uses `fetch`, which may be restricted by some browsers on local files. A local server is recommended.

## Customizing

### Menu Items

Edit the `MENU_DATA` array in `app.js:10`. Each item supports:

```js
{
  id: 'tea-milo',            // unique identifier
  name: 'Tea (Milo) + Bread with Egg',
  category: 'tea',           // used for filtering
  diet: 'sweet',
  isVeg: true,
  price: 25.00,
  image: 'assets/tea and bread.jpg',
  description: '...',
  customizable: true,
  options: { toppings: [], sides: [] }  // optional add-ons with { name, price }
}
```

### Order Email Address

Orders are sent to the address in `ORDER_EMAIL_ADDRESS` at `app.js:78`. Change it to route orders to a different inbox.

FormSubmit requires the recipient address to be confirmed once via the activation email sent on the first submission.

### Branding and Colors

Colors, fonts, spacing, and shadows are defined as CSS custom properties in the `:root` block at `styles.css:6`. Update those values to re-theme the site.

### Contact Details

Phone, email, and delivery information live in the header and footer of `index.html`.

## How Ordering Works

1. A customer selects an item and opens the customizer.
2. The cart is saved in the browser under `sunrise_plate_cart`.
3. At checkout, delivery details are validated client-side.
4. The order is POSTed to `https://formsubmit.co/ajax/<ORDER_EMAIL_ADDRESS>` as JSON.
5. On success, the cart is cleared and a confirmation modal is shown.

Payment is collected in cash on delivery; no payment gateway is integrated.

## Tech Stack

- HTML5
- CSS3 (custom properties, flexbox, grid, media queries)
- Vanilla JavaScript (ES6+)
- FormSubmit for order emails
- `localStorage` for client-side persistence

## Notes and Known Limitations

- There is no backend, database, or authentication; orders rely entirely on the email service.
- Menu filtering/search UI is defined in CSS and JS but the controls are currently removed from `index.html`.
- Some UI references remain from earlier iterations (e.g., empty-cart copy mentioning pancakes and cold brew).
- The catalog currently contains four combos, while the hero/menu text still references eight items.

## License

No license specified. Contact the repository owner before reusing the code or assets.
