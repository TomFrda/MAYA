import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import 'api_service.dart';
import 'main_page.dart';

class ProfileCustomizationPage extends StatefulWidget {
  final String token;

  ProfileCustomizationPage({required this.token});

  @override
  _ProfileCustomizationPageState createState() => _ProfileCustomizationPageState();
}

class _ProfileCustomizationPageState extends State<ProfileCustomizationPage> {
  final _formKey = GlobalKey<FormState>();
  String _bio = '';
  File? _photo;

  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage() async {
    final pickedFile = await _picker.pickImage(source: ImageSource.gallery);

    setState(() {
      if (pickedFile != null) {
        _photo = File(pickedFile.path);
      } else {
        print('No image selected.');
      }
    });
  }

  void _customizeProfile() async {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();
      try {
        if (_photo != null) {
          await ApiService.uploadProfilePhoto(widget.token, _photo!);
        }
        await ApiService.updateUserProfile(widget.token, {
          'bio': _bio,
        });
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => MainPage(token: widget.token)),
        );
      } catch (e) {
        print('Failed to customize profile: $e');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Customize Profile'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            children: <Widget>[
              TextFormField(
                decoration: InputDecoration(labelText: 'Bio'),
                validator: (value) {
                  if (value == null || value.isEmpty) {
                    return 'Please enter your bio';
                  }
                  return null;
                },
                onSaved: (value) {
                  _bio = value!;
                },
              ),
              SizedBox(height: 20),
              _photo == null
                  ? Text('No image selected.')
                  : Image.file(_photo!),
              ElevatedButton(
                onPressed: _pickImage,
                child: Text('Select Photo'),
              ),
              SizedBox(height: 20),
              ElevatedButton(
                onPressed: _customizeProfile,
                child: Text('Save'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}