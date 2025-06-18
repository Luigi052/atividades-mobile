import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, TouchableOpacity } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { useNavigation } from '@react-navigation/native';
import { salvarFavorito } from './database';

export default function Home() {
  const [pais, setPais] = useState('');
  const [nome, setNome] = useState('');
  const [universidades, setUniversidades] = useState([]);
  const navigation = useNavigation();

  const buscar = async () => {
    if (!pais && !nome) {
      alert('Informe ao menos um campo!');
      return;
    }

    const url = `http://universities.hipolabs.com/search?${pais ? `country=${pais}` : ''}${pais && nome ? '&' : ''}${nome ? `name=${nome}` : ''}`;
    const response = await fetch(url);
    const data = await response.json();
    setUniversidades(data);
  };

  const adicionarFavorito = async (item) => {
    await salvarFavorito(item.name, item.web_pages[0]);
    navigation.navigate('Favoritos');
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput placeholder="País" value={pais} onChangeText={setPais} style={{ borderBottomWidth: 1 }} />
      <TextInput placeholder="Universidade" value={nome} onChangeText={setNome} style={{ borderBottomWidth: 1, marginVertical: 10 }} />
      <Button title="Buscar" onPress={buscar} />
      <FlatList
        data={universidades}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => adicionarFavorito(item)}>
            <Text style={{ padding: 10, fontSize: 16 }}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}