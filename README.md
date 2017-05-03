# wiselike

> 自己的 wiselike 自己救

## Development

### Getting start

``` bash
# install dependencies
yarn install

# develop web
yarn dev-web # port 8000

# .env
cp .env.example .env
# Then update .env for DISCOURSE_SSO_SECRET, DISCOURSE_API_KEY and DISCOURSE_API_USERNAME

# develop API proxy (requires .env to be set)
yarn dev-proxy # port 9000
```

### Proxy Server Development

#### Proxy APIs

With `yarn dev-proxy`, proxy server is serving on http://localhost:9000 by default.
Or you might use the following APIs hosted on 139.162.109.88 (dev only, not always up-to-date)

##### Login
 - `GET http://139.162.109.88:9000/login`
 - return json: `{'sso': '{sso}', 'sig': '{sig}', 'username': '{username}'}`
 
##### List all users
 - `GET http://139.162.109.88:9000/users`
 
##### Get user profile
 - `GET http://139.162.109.88:9000/users/{user}`
 
##### Get my profile
 - `GET http://139.162.109.88:9000/me?sso={sso}&sig={sig}`

##### Get my username
 - `GET http://139.162.109.88:9000/whoami?sso={sso}&sig={sig}`
 
##### Get wisdoms of a user
 - `GET http://139.162.109.88:9000/users/{user}/wisdoms`
 
##### Ask a question
 - `POST http://139.162.109.88:9000/users/{user}/wisdoms?sso={sso}&sig={sig}`
 - HTTP Body: `?title={title}&raw={raw}`
  
##### Replay question
 - `POST http://localhost:9000/users/{user}/wisdoms/topic?sso={sso}&sig={sig}`

##### Create Profile
 - `POST http://localhost:9000/users/{user}/createprofile?sso={sso}&sig={sig}`
 
 
#### sso, sig and username

 - `sso` and `sig` should keep private, after signing in through the proxy `/login` API, browser stores `sso` and `sig` in Localstroage. You should pass `sso` and `sig` to proxy APIs on all user-specific operations. 
 - `username` was stored in localStorage too after signing in. However, please use `username` only for display purpose, never trust its value.


## Production

`node build/build.js`

`pm2 start ./ecosystem.config.js`


## Design - Naming

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

## Design - User stories

 - As a guest, I can sign on by Discourse SSO
 - As a member, I can ask questions on s page, these unanswered questions prviate  are only accessible by the authors (askers) and the profile owner.
 - As a member, I can reply (answer) questions on my page, and then these answered questions public .
 - As a member, I can reply to any public Wisdoms.
 - As a guest, I can read any public Wisdoms.
 - As a member, I can update my profile (page) information.Wisdomsbecome Wisdomsaka someone
