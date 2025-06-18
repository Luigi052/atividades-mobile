import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

class TelaCadastro extends StatefulWidget {
  const TelaCadastro({super.key});

  @override
  State<TelaCadastro> createState() => _TelaCadastroState();
}

class _TelaCadastroState extends State<TelaCadastro> {
  final _formKey = GlobalKey<FormState>();

  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _valorController = TextEditingController();
  final TextEditingController _numeroController = TextEditingController();

  int? _parImpar; 

  Future<void> _cadastrarJogador() async {
    if (_usernameController.text.isEmpty) return;

    final url = Uri.parse('https://par-impar.glitch.me/novo');
    final body = json.encode({'username': _usernameController.text});

    try {
      final response = await http.post(url, body: body, headers: {'Content-Type': 'application/json'});
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('Jogador cadastrado: $data');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Jogador ${_usernameController.text} cadastrado!')),
        );
      } else {
        print('Erro ao cadastrar jogador: ${response.statusCode}');
      }
    } catch (e) {
      print('Erro ao cadastrar jogador: $e');
    }
  }

  Future<void> _fazerAposta() async {
    if (_usernameController.text.isEmpty ||
        _valorController.text.isEmpty ||
        _numeroController.text.isEmpty ||
        _parImpar == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Preencha todos os campos da aposta')),
      );
      return;
    }

    final url = Uri.parse('https://par-impar.glitch.me/aposta');
    final body = json.encode({
      'username': _usernameController.text,
      'valor': int.tryParse(_valorController.text) ?? 0,
      'parimpar': _parImpar,
      'numero': int.tryParse(_numeroController.text) ?? 1,
    });

    try {
      final response = await http.post(url, body: body, headers: {'Content-Type': 'application/json'});
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        print('Aposta feita: $data');
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(data['msg'] ?? 'Aposta realizada!')),
        );
        Navigator.pop(context, true);
      } else {
        print('Erro ao fazer aposta: ${response.statusCode}');
      }
    } catch (e) {
      print('Erro ao fazer aposta: $e');
    }
  }

  @override
  void dispose() {
    _usernameController.dispose();
    _valorController.dispose();
    _numeroController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Cadastro e Aposta'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                controller: _usernameController,
                decoration: const InputDecoration(labelText: 'Nome do Jogador'),
                validator: (value) => value == null || value.isEmpty ? 'Informe o nome' : null,
              ),
              const SizedBox(height: 10),
              ElevatedButton(
                onPressed: _cadastrarJogador,
                child: const Text('Cadastrar Jogador'),
              ),
              const Divider(height: 40),
              TextFormField(
                controller: _valorController,
                decoration: const InputDecoration(labelText: 'Valor da Aposta'),
                keyboardType: TextInputType.number,
                validator: (value) => value == null || value.isEmpty ? 'Informe o valor' : null,
              ),
              const SizedBox(height: 10),
              TextFormField(
                controller: _numeroController,
                decoration: const InputDecoration(labelText: 'Número (1 a 5)'),
                keyboardType: TextInputType.number,
                validator: (value) {
                  if (value == null || value.isEmpty) return 'Informe o número';
                  final n = int.tryParse(value);
                  if (n == null || n < 1 || n > 5) return 'Número deve ser entre 1 e 5';
                  return null;
                },
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: RadioListTile<int>(
                      title: const Text('Par'),
                      value: 2,
                      groupValue: _parImpar,
                      onChanged: (v) {
                        setState(() => _parImpar = v);
                      },
                    ),
                  ),
                  Expanded(
                    child: RadioListTile<int>(
                      title: const Text('Ímpar'),
                      value: 1,
                      groupValue: _parImpar,
                      onChanged: (v) {
                        setState(() => _parImpar = v);
                      },
                    ),
                  )
                ],
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () {
                  if (_formKey.currentState!.validate()) {
                    _fazerAposta();
                  }
                },
                child: const Text('Fazer Aposta'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
