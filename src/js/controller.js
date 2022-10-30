//imports

import * as model from './model.js';
import { MODAL_CLOSE_SEC } from './config.js'
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime/runtime';
import View from './views/View.js';


if(module.hot){
  module.hot.accept();
}



// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipes = async function(){
  try{

    const id = window.location.hash.slice(1);

    if(!id) return;
    recipeView.renderSpinner();

    resultsView.update(model.getSearchResultsPage());


    //1 loading recipe
    await model.loadRecipe(id);

    //2 rendering recipe
    recipeView.render(model.state.recipe);
    bookmarksView.update(model.state.bookmarks);
  } catch (error){
    recipeView.renderError();
  }
};

const controlSearchResults = async function(){
  try{
    resultsView.renderSpinner();

    const query = searchView.getQuery();
    if(!query) return;

    await model.loadSearchResults(query);

    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    paginationView.render(model.state.search)
    
  }catch(error){
    console.log(error);
  }
};


const controlPagination = function(goToPage){
  resultsView.render(model.getSearchResultsPage(goToPage));

  paginationView.render(model.state.search)
}

const controlServings = function (newServings){
  // update the recipe servings (in state)
  model.updateServings(newServings);
  // update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);

}


const controlAddBookmark = function(){
  if(!model.state.recipe.bookmarked) {model.addBookmark(model.state.recipe)}
  else {model.removeBookmark(model.state.recipe)}

  recipeView.update(model.state.recipe);

  bookmarksView.render(model.state.bookmarks);
}

const controlBookmarks = function(){
  bookmarksView.render(model.state.bookmarks);
}

const controlAddRecipe = async function(newRecipe){
  try{
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe)

    recipeView.render(model.state.recipe);

    addRecipeView.renderMessage();

    bookmarksView.render(model.state.bookmarks);

    window.history.pushState(null, '', `#${model.state.recipe.id}`)

    setTimeout(function(){
      addRecipeView.toggleWindow()
    },MODAL_CLOSE_SEC * 1000);
  }
  catch(error){
    console.error('XXX', error);
    addRecipeView.renderError(error.message);
  }
}

//init

const init =function (){
  bookmarksView.addHanlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
}
init();