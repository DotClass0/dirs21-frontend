const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
const cors = require("cors")
const app = express();
const port = 9000;
const { uuid } = require("uuidv4");

// setup middleware
app.use(bodyParser.json());
app.use(cors());

app.use('/frontend', express.static('dist'))

const fs = require('fs')
fs.openSync('db', 'r+')

var _dishes;

try {
    _dishes = JSON.parse(fs.readFileSync('db').toString());
} catch {
    _dishes = [];
}

function save() {
    fs.writeFile('db', JSON.stringify(_dishes), () => {});
}

// get dishes
router.get('/dishes', (req, res) => {
    res.json({
        status: "OK",
        data: _dishes
    });
});

// clear dishes
router.get('/dishes/clear', (req, res) => {
    _dishes = [];
    save();

    res.json({
        status: "OK"
    });
});

// get dish by id
router.get('/dishes/:_id', (req, res) => {
    const dish = _dishes.find(x => x._id === req.params._id);

    res.json({
        status: "OK",
        data: dish ? dish : null
    });
});

// insert/update dish
router.put('/dishes', (req, res) => {
    if (req.body == null) {
        res.json({
            status: "Failed",
            message: "No content provided"
        });
    }
    else {
        let dish = req.body,
            status = "OK";
        
        if (!dish._id) {
            //
            dish._id = uuid();
            dish._Created = new Date();
            dish._Changed = null;

            //
            _dishes.push(dish);
            save();
        }
        else {
            //
            const dishIndex = _dishes.findIndex(x => x._id === dish._id);

            //
            if (dishIndex >= 0) {
                //
                dish._Changed = new Date();

                //
                _dishes[dishIndex] = dish;
                save();
            }
            else {
                //
                status = `dish not found for _id ${dish._id}`;
            }
        }

        res.json({
            status: status,
            data: dish
        });
    }
});

// delete dish
router.delete('/dishes/:_id', (req, res) => {
    let dishIndex = _dishes.findIndex(x => x._id === req.params._id);

    if (dishIndex !== -1) {
        _dishes.splice(dishIndex, 1);
        save();
    }

    res.json({
        status: "OK",
        message: dishIndex !== -1 ? "Dish deleted" : "Dish not found"
    });
});


//
app.use(router);

//
app.listen(port, () => {
    console.log(`api is ready on http://localhost:${port}`)
});