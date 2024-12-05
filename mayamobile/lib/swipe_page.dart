import 'package:flutter/material.dart';
import 'package:tcard/tcard.dart';

class SwipePage extends StatefulWidget {
  @override
  _SwipePageState createState() => _SwipePageState();
}

class _SwipePageState extends State<SwipePage> {
  List<Map<String, String>> users = [
    {
      'name': 'Alice',
      'age': '25',
      'photo': 'https://via.placeholder.com/150'
    },
    {
      'name': 'Bob',
      'age': '30',
      'photo': 'https://via.placeholder.com/150'
    },
    {
      'name': 'Charlie',
      'age': '28',
      'photo': 'https://via.placeholder.com/150'
    },
  ];

  @override
  Widget build(BuildContext context) {
    List<Widget> cards = users.map((user) {
      return Card(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Image.network(user['photo']!),
            SizedBox(height: 20),
            Text(
              user['name']!,
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            Text(
              'Age: ${user['age']}',
              style: TextStyle(fontSize: 20),
            ),
          ],
        ),
      );
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: Text('Swipe Page'),
      ),
      body: Center(
        child: Container(
          height: MediaQuery.of(context).size.height * 0.6,
          child: TCard(
            cards: cards,
            onForward: (index, info) {
              print('Swiped forward to $index');
            },
            onBack: (index, info) {
              print('Swiped back to $index');
            },
            onEnd: () {
              print('End of cards');
            },
          ),
        ),
      ),
    );
  }
}