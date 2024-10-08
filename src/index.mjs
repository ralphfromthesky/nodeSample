import express, { raw, response } from "express";
import { query, validationResult, body } from "express-validator";
import cookieParser, { signedCookie } from "cookie-parser";
import session from "express-session";

const app = express();
//for parsing cookie or converting string to an object
// app.use(cookieParser())
//you can also pass secret to cookieParser for authentication
app.use(cookieParser("helloworld"));

//need this one declare first before using app.get/post/put/delete/patch need on top ordering is matter
app.use(express.json()); // this one is for parsing data middleware

//if youre using app.use(routes) make sure you put this routes last before any app.use()
app.use(
  session({
    secret: "gogo", //simple secrt key
    saveUninitialized: false, // this one have to do with sessin storage if you dont want to save unmodified session data to session storrage,
    //for example a visiitor on your site and they not doing anything you dont want to save their session to eat alot of memory, best user authentication and managing user sessin
    resave: false, // forcing a session save back to session store even if the sessin if self never modified at all
    cookie: {
      maxAge: 60000 * 60, // for session expiration
    },
  })
);

const loggingMiddleware = (request, response, next) => {
  console.log(`${request.method} --- ${request.url}  `);
  next();
};

const PORT = process.env.PORT || 3000;

//http://localhost:3000 for example using cookie, this route must visit first so we can store cookie for authentication, like opening other routes, this routes must visit first
app.get("/", (request, response) => {
  // response.send('hellow world!')
  // response.send({msg: 'hello'})
  //setting up time for cookie if this one expires, the authentication also expire so you cannot visit other roustes,because it expires
  //you can also signed a cookie and you need to tracke which cookis is signed or not
  console.log(request.session); //it logs cookie object session
  console.log(request.session.id); //it logs session id this one will generate new everytime u make a request of thia api routes

  request.session.visited = true; // this one will saves session id, so every you make a request the servel wiil know is request like an authneticaation then id will not change or genertaed every single time
  //so they can attached the correct dta
  request.sessionStore.get(request.session.id, (err, sessionData) =>{ //this one will give you the sessionData on whats happening, sessin id.
    if(err) {
      console.log(err);
      throw err;
    }
    console.log(sessionData)
  })
  response.cookie("hello", "world", { maxAge: 60000 * 2 , signed: true });
  response.status(201).send({ msg: "ralph" });
});

const sampletObject = [
  { name: "ralp", age: 40, location: "navotas" },
  { name: "shenron", age: 10, location: "malabon" },
  { name: "gadwin", age: 5, location: "makati" },
];
// using cookie for sample authentication,
app.get("/api/sampleRoute/employee", (request, response) => {
  // console.log(request.cookies)

  console.log(request.session)
  console.log(request.session.id)


  // console.log(request.headers.cookie);
  // console.log(request.cookies);
  // console.log(request.signedCookies.hello);
  //cookies and signedCookie are different yo need to track which is signed or not
  if (request.signedCookies.hello && request.signedCookies.hello === "world") {
    response.status(200).send(sampletObject);
  } else {
    return response.status(403).send("you need the correct cookie");
  }
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
  (request, response, next) => {
    response.status(201).send([
      { id: 1, name: "ralph", location: "navotas" },
      { id: 2, name: "shenrron", location: "malabon" },
      { id: 3, name: "gadwin", location: "makati" },
    ]);
    next();
  },
  () => {
    console.log("ralph next() using");
    console.log(
      `using next() this this one consoliing the object ${sampletObject}`
    );
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


//+++++++++++++++++++++++++++++++++++++++++++++++ session part 2
// thi one i session logging in
const objectNames = [
  {username: 'ralph', password: '123456'},
  {username: 'shenron', password: '123shenron'},
  {username: 'gadwin', password: '123gadwin'},


]

app.post('/api/auth' , (request, response) => {
const {body: {username, password}} = request;

// reponse.send(objectNames)
const findUser = objectNames.find((name) => name.username === username);
if(!findUser || findUser.password !== password) return response.status(401).send({msg: 'BAD CREDENTIALS'})
request.session.user = findUser;
return response.status(200).send(findUser)
})

app.get('/api/auth/status', (request, response) => {
  request.sessionStore.get(request.sessionID, (err, session) => {
    console.log(session)
  })
  return request.session.user ? response.status(200).send(request.session.user)
  : response.status(401).send({msg: 'NOT AUTHENTICATED'})
})

///++++++++++++++++++++++++++++++++++++
//----------------------------
//sample authe if log in uisng /api/auth

app.post('/api/cart', (request, response) => {
  if(!request.session.user) return response.sendStatus(401);
  const {body: item} = request;
  const {cart} = request.session;
  if(cart) {
    cart.push(item)
  } else {
    request.session.cart = [item]
  }
  return response.status(201).send(item)
})

app.get('/api/cart', (request, response) => {
  if(!request.session.user) return response.sendStatus(401);
  return response.send(request.session.cart ?? []);
})
//----------------------------

app.listen(PORT, () => {
  console.log(`server is starting at  ${PORT}`);
});
