let express = require("express");
let graphqlHTTp = require("express-graphql");
let { buildSchema } = require("graphql");
let cors = require("cors");
let Pusher = require("pusher");
let bodyParser = require("body-parser");
let Multipart = require("connect-multiparty");

let schema = buildSchema(`
    type User {
        id : String!
        nickname : String!
        avatar : String!
    }
    type Post {
        id : String!
        user : User!
        caption : String!
        image : String!
    }
    type Query {
        user(id: String) : User!
        post(user_id: String, post_id: String) : Post!
        posts(user_id: String) : [Post]
    }
`);

let userslist = {
    a: {
        id: "a",
        nickname: "Nitish",
        avatar: "https://instagram.fprg2-1.fna.fbcdn.net/vp/13ac0de02b1d4a76c4eb07cb177560d2/5BB6F52C/t51.2885-19/s150x150/26868940_258824621319791_169660790264037376_n.jpg"
    }
};
let postslist = {
    a: {
        a: {
            id: "a",
            user: userslist["a"],
            caption: "Living the dream",
            image: "https://instagram.fprg2-1.fna.fbcdn.net/vp/9f89767b0958e7b94e23a56e14b59cce/5BAB353A/t51.2885-15/e35/28158675_196031147833419_7382969114475626496_n.jpg"
        },
        b: {
            id: "b",
            user: userslist["a"],
            caption: "Drinks",
            image: "https://instagram.fprg2-1.fna.fbcdn.net/vp/33467bd580743a69e74f2de56b294489/5BBF6D3D/t51.2885-15/e35/30829901_423407141455746_4404138458356908032_n.jpg"
        },
        c: {
            id: "c",
            user: userslist["a"],
            caption: "Living the dream",
            image: "https://instagram.fprg2-1.fna.fbcdn.net/vp/9f89767b0958e7b94e23a56e14b59cce/5BAB353A/t51.2885-15/e35/28158675_196031147833419_7382969114475626496_n.jpg"
        },
        d: {
            id: "d",
            user: userslist["a"],
            caption: "Drinks",
            image: "https://instagram.fprg2-1.fna.fbcdn.net/vp/33467bd580743a69e74f2de56b294489/5BBF6D3D/t51.2885-15/e35/30829901_423407141455746_4404138458356908032_n.jpg"
        }
    }
};

let root = {
    user : function ({ id }) {
        return userslist[id];
    },
    post : function ({ user_id, post_id }) {
        return postslist[user_id][post_id];
    },
    posts : function ({ user_id }) {
        return Object.values(postslist[user_id])
    }
};

let pusher = new Pusher({
    appId : '534440',
    key : 'c9e2a6aaa40786360aff',
    secret : 'e7dbd7c3306d1a9e0dc1',
    cluster : 'ap2',
    encrypted : true
});

let multipartMiddleware = new Multipart();

let app = express();
app.use(cors());
app.use(
    "/graphql",
    graphqlHTTp({
        schema : schema,
        rootValue : root,
        graphiql : true
    })
);

app.post('/newpost', multipartMiddleware, (req, res) => {
    let post = {
        user : {
            nickname : req.body.name,
            avatar : req.body.avatar
        },
        image : req.body.image,
        caption : req.body.caption
    }

    pusher.trigger("post-channel", "new-post", {
        post
    });

    return res.json({status : "Post created"});
});

app.listen(4000);
console.log("Listening");