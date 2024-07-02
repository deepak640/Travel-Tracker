import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "15124117",
  port: 8000,
});
db.connect();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const checkVisisted = async () => {
  const { rows, rowCount } = await db.query(
    "SELECT country_code FROM visited_countries"
  );
  let countries = [];
  rows.forEach((data) => countries.push(data.country_code));
  return { countries, rowCount };
};

app.get("/", async (req, res) => {
  //Write your code here.
  const { countries, rowCount } = await checkVisisted();
  res.render("index.ejs", { countries: countries, total: rowCount });
});

app.post("/add", async (req, res) => {
  const { country } = req.body;
  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%'",
      [country.toLowerCase()]
    );
    const code = result.rows[0].country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code)  VALUES($1)",
        [code]
      );
      res.redirect('/')
    } catch (error) {
      const { countries, rowCount } = await checkVisisted();
      res.render("index.ejs", {
        countries: countries,
        total: rowCount,
        error: "Country has already been added, try again.",
      });
    }
  } catch (error) {
    const { countries, rowCount } = await checkVisisted();
    res.render("index.ejs", {
      countries: countries,
      total: rowCount,
      error: "Country name does not exist, try again.",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
