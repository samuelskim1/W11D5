import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { getPokemonItems, deletePokemonItem } from "../store/items";

const PokemonItems = ({ pokemon, setEditItemId, setDeleteItemId, deleteItemId }) => {
  let itemState;

  // let deleted = false;
  
  const items = useSelector((state) => {
    if (!pokemon.items) return null;
    itemState = pokemon.items.map(itemId => state.items[itemId]);
    return itemState;
    // return pokemon.items.map(itemId => state.items[itemId]);
  });
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("get items",pokemon);
    dispatch(getPokemonItems(pokemon.id));
  }, [dispatch, pokemon.id])

  // useEffect(() => {
  //   dispatch(deletePokemonItem(deleteItemId, pokemon.id));
  // }, [deleteItemId])

  if (!items) {
    return null;
  }


  return items.map((item) => (
    <tr key={item.id}>
      <td>
        <img
          className="item-image"
          alt={item.imageUrl}
          src={`${item.imageUrl}`}
        />
      </td>
      <td>{item.name}</td>
      <td className="centered">{item.happiness}</td>
      <td className="centered">${item.price}</td>
      {pokemon.captured && (
        <td className="centered">
          <button onClick={() => setEditItemId(item.id)}>
            Edit
          </button>
        </td>
      )}
      {pokemon.captured && (
        <td className="centered">
          <button onClick={async () => {
            await dispatch(deletePokemonItem(item.id, pokemon.id));

            // deleted = true;
            // setDeleteItemId(item.id);
            await dispatch(getPokemonItems(pokemon.id));
          }}>
            Delete
          </button>
        </td>
        
      )}
    </tr>
  ));
};

export default PokemonItems;