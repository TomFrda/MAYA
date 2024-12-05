import 'package:flutter/material.dart';

class LikedProfilesPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Liked Profiles'),
      ),
      body: Center(
        child: Text('These are the most liked profiles of the week'),
      ),
    );
  }
}