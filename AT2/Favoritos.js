import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import { listarFavoritos, removerFavorito } from './database';

export default function Favoritos() {
  const [favoritos, setFavoritos] = useState([]);

  const carregar = async () => {
    const dados = await listarFavoritos();
    setFavoritos(dados);
  };

  const remover = async (id) => {
    await removerFavorito(id);
    carregar();
  };

  useEffect(() => {
    carregar();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <FlatList
        data={favoritos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => remover(item.id)}>
            <Text style={{ padding: 10, fontSize: 16 }}>{item.nome} - {item.site}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}