# wiselike

> A Vue.js project

## Development

``` bash
# install dependencies
yarn install

# develop web
yarn dev-web # port 8000

# develop API proxy
yarn dev-proxy # port 9000

### Dev only API

> when not running `yarn dev-proxy`, you may use these API to develop web.

 - http://139.162.109.88:9000/login
 - http://139.162.109.88:9000/logout
 - http://139.162.109.88:9000/users
 - http://139.162.109.88:9000/users/audreyt
 - http://139.162.109.88:9000/me = http://139.162.109.88:9000/users/{my username}
 - http://139.162.109.88:9000/whoami
 - http://139.162.109.88:9000/users/audreyt/wisdoms
```

## Build Setup

``` bash
# install dependencies
yarn install

# build for production with minification
yarn build

# build for production and view the bundle analyzer report
yarn build --report
```

For detailed explanation on how things work, checkout the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).


## API

 - /users
 - /login
 - /logout
 - /users/{id}
 - /users/{id}/widdoms
 - /wisdoms/{id}
 - /search

## Naming

### Entities

 - Profile - A profile page of a member
 - Wisdom - A thread of a question and its replies. A Wisdom belongs to a profile.
 - Member - A registered user.
 - Guest - A guest user.

### Actions

 - Register / Login
 - Ask - Ask a quesion
 - Answer / Reply - Answer / reply to a question.
 - Subscribe
 - Appreciate

## Stories

 - As a guest, I can sign on by Discourse SSO
 - As a member, I can ask questions on s page, these unanswered questions prviate  are only accessible by the authors (askers) and the profile owner.
 - As a member, I can reply (answer) questions on my page, and then these answered questions public .
 - As a member, I can reply to any public Wisdoms.
 - As a guest, I can read any public Wisdoms.
 - As a member, I can update my profile (page) information.Wisdomsbecome Wisdomsaka someone
