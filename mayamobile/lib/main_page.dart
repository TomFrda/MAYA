import 'package:flutter/material.dart';
import 'swipe_page.dart';
import 'profile_page.dart';
import 'liked_profiles_page.dart';
import 'match_page.dart'; // Importez le nouveau composant

class MainPage extends StatefulWidget {
  final String token;

  MainPage({required this.token});

  @override
  _MainPageState createState() => _MainPageState();
}

class _MainPageState extends State<MainPage> {
  int _selectedIndex = 0;

  static List<Widget> _widgetOptions = <Widget>[
    LikedProfilesPage(),
    Text('Placeholder for another page'),
    SwipePage(),
    MatchPage(), // Ajoutez le nouvel onglet ici
    ProfilePage(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: _widgetOptions.elementAt(_selectedIndex),
      ),
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(Icons.favorite),
            label: 'Liked',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.search),
            label: 'Search',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.swap_horiz),
            label: 'Swipe',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.favorite), // Icône pour l'onglet Match
            label: 'Match',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Colors.pink,
        onTap: _onItemTapped,
      ),
    );
  }
}