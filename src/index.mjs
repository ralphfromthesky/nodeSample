import express, { raw, response } from "express";
import { query, validationResult, body } from "express-validator";

const app = express();

//need this one declare first before using app.get/post/put/delete/patch need on top ordering is matter
app.use(express.json()); // this one is for parsing data middleware

const loggingMiddleware = (request, response, next) => {
  console.log(`${request.method} --- ${request.url}  `);
  next();
};

const PORT = process.env.PORT || 3000;

//http://localhost:3000
app.get("/", (request, response) => {
  // response.send('hellow world!')
  // response.send({msg: 'hello'})
  response.status(201).send({ msg: "ralph" });
});

//localhost:3000/api/users
// using middleware here, like chaining using next() then it will execute next middleware
app.get(
  "/api/users",
  (reqest, response, next) => {
    console.log("after thi it will go to the next middleware");
    console.log("then showing un the response");

    next();
  },
  (request, response) => {
    response.status(201).send([
      { id: 1, name: "ralph", location: "navotas" },
      { id: 2, name: "shenrron", location: "malabon" },
      { id: 3, name: "gadwin", location: "makati" },
    ]);
  }
);

//using .status
app.get("/api/tae", (req, res) => {
  res.status(200).send({ msg: "ano?" });
});

//http://localhost:3000/api/student/name
//usiing query from 'express-validation', chaining methods validation for query parameters
app.get(
  "/api/student/name",
  query("filter")
    .isString()
    .notEmpty()
    .withMessage("must be not empty")
    .isLength({ min: 3, max: 10 })
    .withMessage("must be between 3 to 10 characters"),
  (req, res) => {
    res.send([
      { name: "james,", age: 14 },
      { name: "johnny,", age: 2 },
      { name: "tessa,", age: 8 },
    ]);
    //this to go deeper about validatot
    // console.log(req['express-validator#contexts'])

    //need to call this console to see the validation result
    const result = validationResult(req);
    console.log(result);
  }
);

const employee = [
  { id: 1, name: "ralph" },
  { id: 2, name: "shenron" },
  { id: 3, name: "gadwin" },
];

app.get("/api/employee", (req, res) => {
  res.send(employee);
});

app.post(
  "/api/employee",
  body("name")
    .notEmpty()
    .withMessage("not empty!")
    .isString()
    .withMessage("must be string names")
    .isLength({ min: 4, max: 12 })
    .withMessage("must be 4 to 12 characters"),
  (request, response) => {
    // response.status(201).send(employee);
    console.log(employee);
    const result = validationResult(request);
    console.log(result);

    //.isEmpty from validationResult
    if (!result.isEmpty())
      return response.status(400).send({ errors: result.array() });
  }
);

app.get("/api/taeMalaki", (request, response) => {
  response.status(201).send(products);
});

const products = [
  { id: 1, product: "iphone", price: 1000 },
  { id: 2, product: "samsung", price: 2000 },
  { id: 3, product: "asus", price: 3000 },
  { id: 4, product: "vivo", price: 4000 },
  { id: 5, product: "tesla", price: 5000 },
];
//GET is for getting data
app.get("/api/products", (request, response) => {
  const {
    query: { filter, value },
  } = request;
  //when filter and value is undefined
  if (!filter && !value) return response.send(products);
  if (filter && value)
    return response.send(
      products.filter((prod) => prod[filter].includes(value))
    );

  return response.send(products); // this is the last return if those if condition has not satisfied
});
//route params using for searching dynamie ":id"
app.get("/api/products/:id", (req, res) => {
  const parsedId = parseInt(req.params.id);
  if (isNaN(parsedId)) {
    return res.status(400).send({ msg: "not a number" });
  }
  const findProducts = products.find((name) => name.id === parsedId);
  if (!findProducts) {
    return res.status(400).send({ msg: "ID not found" });
  }

  return res.status(200).send({ msg: `found id ${findProducts.id}` });
});

//POST is for sending/ adding data
app.post("/api/products", (request, response) => {
  console.log(request.body);
  const { body } = request;

  const newProducts = { id: products[products.length - 1].id + 1, ...body }; //pushing this to product
  products.push(newProducts);
  return response.status(201).send(newProducts);
});

//PUT for deleting the entire object
app.put("/api/products/:id", (request, response) => {
  const {
    body,
    params: { id },
  } = request;
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) return response.sendStatus(400);

  const findProductId = products.findIndex((prod) => prod.id === parsedId);
  if (findProductId === -1) return response.sendStatus(404);
  products[findProductId] = { id: parsedId, ...body };
  return response.sendStatus(200);
});

//DELETE
app.delete("/api/products/:id", (request, response) => {
  const {
    params: { id },
  } = request;

  const parseId = parseInt(id);

  if (isNaN(parseId)) return response.status(400).send("not a number!");

  const findProductId = products.findIndex((prod) => prod.id === parseId);

  if (parseId === -1) return response.sendStatus(404).send("cant find id");
  products.splice(findProductId, 1);
  return response.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`server is starting at  ${PORT}`);
});
