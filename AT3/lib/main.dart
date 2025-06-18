import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import 'tela_cadastro.dart';

void main() {
  runApp(const ParImparApp());
}

class ParImparApp extends StatelessWidget {
  const ParImparApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Par ou Ímpar',
      theme: ThemeData(primarySwatch: Colors.blueGrey),
      home: const TelaListaJogadores(),
    );
  }
}

class TelaListaJogadores extends StatefulWidget {
  const TelaListaJogadores({super.key});

  @override
  State<TelaListaJogadores> createState() => _TelaListaJogadoresState();
}

class _TelaListaJogadoresState extends State<TelaListaJogadores> {
  List jogadores = [];
  String? jogadorSelecionado;
  String? oponenteSelecionado;

  @override
  void initState() {
    super.initState();
    _buscarJogadores();
  }

  Future<void> _buscarJogadores() async {
    try {
      final response = await http.get(Uri.parse('https://par-impar.glitch.me/jogadores'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          jogadores = data['jogadores'];
        });
        print('Jogadores carregados: $jogadores');
      } else {
        print('Erro ao buscar jogadores: ${response.statusCode}');
      }
    } catch (e) {
      print('Erro ao buscar jogadores: $e');
    }
  }

  void _jogar() async {
    if (jogadorSelecionado == null || oponenteSelecionado == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Selecione jogador e oponente')),
      );
      return;
    }

    try {
      final url = 'https://par-impar.glitch.me/jogar/$jogadorSelecionado/$oponenteSelecionado';
      final response = await http.get(Uri.parse(url));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('Resultado do jogo: $data');
        showDialog(
          context: context,
          builder: (_) => AlertDialog(
            title: const Text('Resultado'),
            content: Text(
                'Vencedor: ${data['vencedor']['username']}\nValor: ${data['vencedor']['valor']}\n'
                'Perdedor: ${data['perdedor']['username']}\nValor: ${data['perdedor']['valor']}'),
            actions: [
              TextButton(onPressed: () => Navigator.pop(context), child: const Text('OK'))
            ],
          ),
        );
        await _buscarJogadores();
      } else {
        print('Erro ao jogar: ${response.statusCode}');
      }
    } catch (e) {
      print('Erro ao jogar: $e');
    }
  }

  Future<void> _verPontos(String username) async {
    try {
      final url = 'https://par-impar.glitch.me/pontos/$username';
      final response = await http.get(Uri.parse(url));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('Pontos de $username: ${data['pontos']}');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Pontos de $username: ${data['pontos']}')),
        );
      } else {
        print('Erro ao buscar pontos: ${response.statusCode}');
      }
    } catch (e) {
      print('Erro ao buscar pontos: $e');
    }
  }

  void _abrirTelaCadastro() async {
    bool? reload = await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const TelaCadastro()),
    );
    if (reload == true) {
      _buscarJogadores();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Par ou Ímpar - Jogadores'),
        actions: [
          IconButton(
            onPressed: _abrirTelaCadastro,
            icon: const Icon(Icons.person_add),
            tooltip: 'Novo jogador',
          )
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: jogadores.length,
              padding: const EdgeInsets.all(5),
              itemBuilder: (context, id) {
                final jogador = jogadores[id];
                final username = jogador['username'];
                final pontos = jogador['pontos'];
                final isJogadorSelecionado = username == jogadorSelecionado;
                final isOponenteSelecionado = username == oponenteSelecionado;

                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 2),
                  child: ListTile(
                    key: Key(username),
                    tileColor: isJogadorSelecionado
                        ? Colors.green[200]
                        : isOponenteSelecionado
                            ? Colors.red[200]
                            : Colors.black12,
                    title: Text(username),
                    subtitle: Text('Pontos: $pontos'),
                    trailing: Wrap(
                      spacing: 10,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.sports_handball),
                          tooltip: 'Selecionar como jogador',
                          onPressed: () {
                            setState(() {
                              jogadorSelecionado = username;
                            });
                            print('Jogador selecionado: $username');
                          },
                        ),
                        IconButton(
                          icon: const Icon(Icons.person_off),
                          tooltip: 'Selecionar como oponente',
                          onPressed: () {
                            setState(() {
                              oponenteSelecionado = username;
                            });
                            print('Oponente selecionado: $username');
                          },
                        ),
                        IconButton(
                          icon: const Icon(Icons.score),
                          tooltip: 'Ver pontos',
                          onPressed: () => _verPontos(username),
                        )
                      ],
                    ),
                    onTap: () {
                      print('Clicou no jogador $username');
                    },
                  ),
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: ElevatedButton.icon(
              onPressed: _jogar,
              icon: const Icon(Icons.play_arrow),
              label: const Text('Jogar'),
              style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(50)),
            ),
          ),
        ],
      ),
    );
  }
}
