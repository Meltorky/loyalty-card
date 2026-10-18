// Every cafe = one folder in /cafes + one entry here.
//   /<slug>        -> Component (customer card)
//   /<slug>/admin  -> Admin     (cashier page, optional)
import CarlosApp from "./carlos/CarlosApp";
import CarlosAdmin from "./carlos/admin/CarlosAdmin";
import carlosConfig from "./carlos/config";

export const cafes = {
  carlos: { config: carlosConfig, Component: CarlosApp, Admin: CarlosAdmin },
  // starbucks: { config: starbucksConfig, Component: StarbucksApp, Admin: StarbucksAdmin },
};

export const getCafe = (slug) => cafes[slug];