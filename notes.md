### W11D4
## Thunk Middleware
​
---
​
## Learning Objectives
​
* Review Redux Cycle
* Remember Rails
* Connect an API backend to React/Redux frontend
* Understand Motivation for Middleware and Thunk
​
---
​
## Learning Outline
​
* Review Redux Cycle
* Long demo!
  * Rails backend API
  * APIUtils - fetch
  * Thunk Action Creators
  * Middleware
* Kahoot!
​
---
​
## Recommendations for Today
​
* Just listen and try to take in _CONCEPTS_ from lecture
* Understand the _MOTIVATION_ for what we build
* Visualize the connection and flow of the code
* Explain it to a friend!
​
---
​
## React Review
​
* Components
* Props
​
---
​
## Redux
​
* Store
  * `getState` (function) -> read
  * `dispatch` (function) -> write
* `Provider` -> context for your whole app
* `useSelector` & `useDispatch` -> React-Redux hooks

## Redux Cycle
​
![Redux Cycle](https://aa-ch-lecture-assets.s3.us-west-1.amazonaws.com/middleware/redux_cycle_hooks.png)
​
---
​
## Redux with Rails
​
![Redux with Rails](https://aa-ch-lecture-assets.s3.us-west-1.amazonaws.com/middleware/redux_cycle_hooks_rails.png)
​
---
​
## Redux with Rails animated
![Redux Cycle GIF](https://aa-ch-lecture-assets.s3.us-west-1.amazonaws.com/middleware/redux_cycle_gif.gif)
​
---
​
## Rails as a JSON API
​
* Rails will: 
  - house a React app in a frontend folder
  - respond to HTTP requests from the frontend with data from our database in the form of JSON
​
---
​
## Demo: Rails backend setup
​
Steps
- Create rails app
    - Setup
        - add dev gems in gemfile: pry-rails, binding_of_caller, better_errors, annotate
        - add byebug gem in development, test
    - Create Models
        - Create migrations and include proper columns and validations
        - Create database and run migrations
        - Check the schema to see if migrations ran properly
    - Create Database
        - Seed database ( `bundle exec rails db:seed` ) 
        - To see all the seeds, open rails console (`rails c`) and do `Tea.all`
    - Create Controllers
        - `rails g controller api/tableName`
            - What this does is that it nests everything inside an API folder
        - to get all of our data
            ```ruby 
                def index
                    @teas = Tea.all
                    render json: @teas
                    #sends all of our teas as json back to our front end
                end
                
                def create
                    @tea = Tea.new(tea_params)
                    if @tea.save
                        render json: @tea
                    else
                        render json: @tea.errors.full_messages
                        #errors are saved into this tea instance
                    end
                end

                def tea_params
                    params.require(:tea).permit(:flavor, :price)
                end
            ```

    - Create Routes
        - routes are going to look slightly different
        ```ruby
            namespace :api, defaults: {format: :json} do 
                resources :teas, only: [:index, :create]
            end

            ## we are nesting our routes to api
            ## this is adding api to the url for us
            ## look at google docs to see how our routes would look like 

        ```
    - Changing Port so that backend and frontend can run on different ports
        - React portion is making calls to our backend (Port 5000)
        - Go to puma.rb

        ```ruby
            port ENV.fetch("PORT") {5000}
        ```

    - View index page
        - `bundle exec rails s` to start server
        - open up localhost.5000/api/teas
            - Remember that we nested our controller/routes all under the api namespace

    - When we seed the database, we can either manually write it in or we could use the Faker bot

Moving frontend into backend
    - create a directory called frontend in the root directory of the app
    - Move all of your frontend files (i.e. src) into your frontend folder
        - Move that frontend folder into the rails app
    - We dont have to worry about this right now because we will write our react files inside of our rails app for the project


---
​
## Break
​
---
​
## Connecting backend & frontend
​
* Receiving backend data through fetch requests
​
```js
  fetch('/api/teas')
    .then(res => res.json())
    .then(data => console.log(data));
```
​
---
​
### Demo: APIUtils - fetch

Frontend Folder
    - create util folder inside src
    - create tea_api_util.js inside util folder
        - This file will hold all of our fetch requests

        ```js
            export const requestTeas = ()  => {
                return fetch('/api/teas')
            }

            export const postTea = (tea) => {
                return fetch('/api/teas', {
                    method: 'POST',
                    body: JSON.stringify(tea) //
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                })
            }

            //making a post request to api/teas
            //specify route and send them the object that we're trying to create (tea)
            //body header = is changing the (tea) object into json format
            //Context-type header = specify the content-type we are passing along which is json
            //Accept header = accepts back json formatted response
            //
        ```
    
    - if we want to test our util methods, we want to put it on the window in the index.js folder

    ```js
        import * as TeaAPIUtil from `,util/tea_api_util`;

        window.TeaAPIUtil = TeaAPIUtil

        //make sure to start both frontend and backend server before trying to fetch
        //make sure to set up a proxy for the backend in the package.json file :
        // "proxy": "https://localhost:5000", do that on the outer object
        // this proxy enables the frontend to make that connect to our backend

        TeaAPIUtil.requestTeas()
        .then(res => res.json())
        .then(data => console.log(data));
        //this is done in the console which returns a console.log of the body response

        //lets test our postTea util method
        let tea = {flavor: 'brown', price: 3}
        TeaAPIUtil.postTea(tea)

        //check our rails server to see if that change was made
        // You can also check through the fetch request and console logging the data
    ```
​   -At this point we can do all of this in our console but we haven't been able to do anything in react yet.
---
​
### What about updating our Redux store?
​
---
​
## Thunk Middleware
​
* Allows you to write _thunk_ action creators that return a _function_ instead of a POJO
* Have actions that are POJOs _or functions_
    - if we are trying to change our store, actions will return an POJO
    - if we are trying to change our backend, actions will return a function
* **Benefits:**
	* Delay the dispatch of an action
  * Conditionally dispatch actions
    - It checks if the action is a function/POJO and based off that make the appropriate request
        -If it is a function, it knows that it's a fetch request and connects to the backend
    - It's a middleman that looks at requests that looks at our store
* `applyMiddleware()`
​
---
​
## Redux actions
​
* Regular **action creator**:
​
```js
  export const receiveTeas = teas => ({
    type: RECEIVE_TEAS,
    teas
  });
```
​
---
​
## Redux actions: thunks
​
* **Thunk action creator**:
​
### Promise syntax
```js
  export const fetchAllTeas = () => (dispatch) => {
    fetch(`/api/teas`)
      .then(res => res.json())
      .then(data => dispatch(receiveTeas(data)));
  };

  //dispatches action (receiveTeas) with the response json object (data) to our store
  //This will update our store based off of our reducer
  //We have access to dispatch because of how middleware passes it in (dispatch).
```
​
### Async syntax
```js
  export const fetchAllTeas = () => async (dispatch) => {
    const res = await fetch(`/api/teas`);
    const data = await res.json();
    dispatch(receiveTeas(data));
  };
```
​
---
​
## Redux actions compared
​
```js
  export const receiveTeas = teas => ({
    type: RECEIVE_TEAS,
    teas
  });
```
​
```js
  export const fetchAllTeas = () => async (dispatch) => {
    const res = await fetch(`/api/teas`);
    const data = await res.json();
    dispatch(receiveTeas(data));
  };
```

- Thunk action fetchAllTeas is referecing the redux action receive teas
- data will be then replace teas argument in receiveTeas actions and then dispatches into the appropriate reducer
​
---
​
## What is Thunk?! Thunk action creator breakdown
​
```js
  // thunk action creator
  export const fetchAllTeas = () => {
    // thunk action
    return async (dispatch, getState) => {
        // fetch request
        const res = await fetch(`/api/teas`);
        const teas = await res.json();
        // when we get a response, dispatch regular action
        dispatch(receiveTeas(teas));
        // ex: dispatch({type: RECEIVE_TEAS, teas: teas})
    };
  };
```
​
---
​
​
## DEMO: Thunk Action Creators
​
- this is in our teaReducer.js file
```js
    import TeaAPIUtil from ''

    //think action creators

    export const fetchAllTeas = () => async (dispatch, getState) => {
        const res = await await TeaAPIUtil.requestTeas();
        const teas = await res.json();
        dispatch(receiveTeas(teas));
    }

    export const createTea = (tea) => async (dispatch) => {
        const res = await TeaAPIUtil.postTea(tea);
        const tea = await res.json();
        dispatch(receiveTea(tea);)
    }

```
- to test these, go to index.js and put them on the window 
```js
    window.fetchAllTeas = fetchAllTeas;
```

- trying to dispatch this method will error out because we cannot dispatch a function without a middleware
- run `npm install redux-logger redux-thunk` to include middleware
- go to store.js

```js
    import {applyMiddleware} from 'redux';
    import logger from 'redux-logger';
    import thunk from 'redux-thunk';
```

- include middleware by adding the argument into the createStore method
- logger is another middleware that will be used to help us log what is happening to our store (helpful for debugging)
- thunk will help us handle the dispatching functions and enable us to utilize thunk action creators

```js
    const configureStore = (preloadedState = {}) => {
        createStore(
            rootReducer,
            preloadedState,
            applyMiddleware(thunk, logger)
        )
    }
```
- as soon as we dispatch this thunk action creator, it will run through the middleware.
- After that resolves, we grab all of that data and we dispatch the resulting object into the store
- That updates our store and then our react component re-renders because our component is subscribed to the store!
    - subscriptions is happening in TeaIndex.js through the useSelector
        - Subscribes the teas to the Tea slice of state
- we only get dispatch and getState through the middleware


-We want to be able to dispatch the fetchAllTeas method when the website loads
```js

    //inside the TeaIndex.js
    import {useEffect} from "react";
    import {useDispatch} from 'react-redux'


    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchAllTeas())
    }, []) 
    //dispatch(fetchAllTeas()) will get intercepted by the 
    //dependency array is an empty one so that we can have the index render only once.


```

-want to make it so that every time we create a new tea, we add it into our db so that it persists
- go to our AddTeaForm file and then change the action in the dispatch to createTea(tea)




---
​
## Break
​
---
​
## Thunk Middleware (Steps)
​
* IF the action is a function
  * Invoke the action, passing in `dispatch` and `getState`
* (else) the action is a POJO
  * Pass the action along to the next middleware or the reducer(s)
​
---
​
![Redux with Rails again](https://aa-ch-lecture-assets.s3.us-west-1.amazonaws.com/middleware/redux_cycle_hooks_rails.png)
​
---
​
## Demystifying the thunk signature
​
* It looks weird
​
```javascript
  const thunk = ({ dispatch, getState }) => next => action => {
    if (typeof action === "function") {
      return action(dispatch, getState);
    }
    return next(action);
  };
​
  export default thunk;
```
​
---
​
## Breaking down thunk
​
```js
  // applyMiddleware will pass in the store
  // this will be invoked for you
  const thunk = function(store) {
    // applyMiddleware will pass in next
    // next represents next piece of middleware to receive an action
    // this will be invoked for you
    return function(next) {
      // Action is what WE wrote in our code
      // this will be invoked for you
      return function(action) {
        if (typeof action === "function") {
          // invoke the action, i.e. make an AJAX request
          return action(store.dispatch, store.getState);
        }
        return next(action);
      };
    };
  };
```
​
---
​
## DEMO: Thunk Middleware
​
---