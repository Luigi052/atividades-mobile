import * as SQLite from 'expo-sqlite';
const db = SQLite.openDatabase('universidades.db');

db.transaction(tx => {
  tx.executeSql('CREATE TABLE IF NOT EXISTS favoritos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, site TEXT)');
});

export const salvarFavorito = (nome, site) => {
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql('INSERT INTO favoritos (nome, site) VALUES (?, ?)', [nome, site], () => resolve());
    });
  });
};

export const listarFavoritos = () => {
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql('SELECT * FROM favoritos', [], (_, { rows }) => {
        resolve(rows._array);
      });
    });
  });
};

export const removerFavorito = (id) => {
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql('DELETE FROM favoritos WHERE id = ?', [id], () => resolve());
    });
  });
};