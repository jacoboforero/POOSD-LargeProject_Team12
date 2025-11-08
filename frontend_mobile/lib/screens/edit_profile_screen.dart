import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/auth_provider.dart';
import '../theme/app_theme.dart';

class EditProfileScreen extends StatefulWidget {
  final Map<String, dynamic>? userData;

  const EditProfileScreen({super.key, this.userData});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _timezoneController = TextEditingController();
  final _locationController = TextEditingController();
  final _lifeStageController = TextEditingController();
  final _jobIndustryController = TextEditingController();
  final _demographicController = TextEditingController();
  final _topicsController = TextEditingController();
  final _interestsController = TextEditingController();
  final _preferredHeadlinesController = TextEditingController();
  final _scrollPastTopicsController = TextEditingController();
  final _newsStyleController = TextEditingController();
  final _newsScopeController = TextEditingController();

  bool _notifyOnBriefing = true;
  bool _isSaving = false;
  String? _errorMessage;
  late final String _email;

  @override
  void initState() {
    super.initState();
    final prefs = widget.userData?['preferences'] as Map<String, dynamic>? ?? {};
    _nameController.text = (widget.userData?['name'] as String?) ?? '';
    _timezoneController.text = (widget.userData?['timezone'] as String?) ?? '';
    _locationController.text = (prefs['location'] as String?) ?? '';
    _lifeStageController.text = (prefs['lifeStage'] as String?) ?? '';
    _jobIndustryController.text = (prefs['jobIndustry'] as String?) ?? '';
    _demographicController.text = (prefs['demographic'] as String?) ?? '';
    _topicsController.text = _listToText(prefs['topics']);
    _interestsController.text = _listToText(prefs['interests']);
    _preferredHeadlinesController.text = _listToText(prefs['preferredHeadlines']);
    _scrollPastTopicsController.text = _listToText(prefs['scrollPastTopics']);
    _newsStyleController.text = (prefs['newsStyle'] as String?) ?? '';
    _newsScopeController.text = (prefs['newsScope'] as String?) ?? '';
    _notifyOnBriefing = (widget.userData?['notificationPrefs']?['onBriefingReady'] as bool?) ?? true;
    _email = (widget.userData?['email'] as String?) ?? '';
  }

  @override
  void dispose() {
    _nameController.dispose();
    _timezoneController.dispose();
    _locationController.dispose();
    _lifeStageController.dispose();
    _jobIndustryController.dispose();
    _demographicController.dispose();
    _topicsController.dispose();
    _interestsController.dispose();
    _preferredHeadlinesController.dispose();
    _scrollPastTopicsController.dispose();
    _newsStyleController.dispose();
    _newsScopeController.dispose();
    super.dispose();
  }

  String _listToText(dynamic value) {
    if (value is List) {
      final list = value.whereType<String>().toList();
      if (list.isEmpty) return '';
      return list.join(', ');
    }
    return '';
  }

  List<String> _parseList(String input) {
    return input
        .split(',')
        .map((item) => item.trim())
        .where((item) => item.isNotEmpty)
        .toList();
  }

  String? _valueOrNull(TextEditingController controller) {
    final text = controller.text.trim();
    return text.isEmpty ? null : text;
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    setState(() {
      _isSaving = true;
      _errorMessage = null;
    });

    final preferences = <String, dynamic>{
      'topics': _parseList(_topicsController.text),
      'interests': _parseList(_interestsController.text),
      'preferredHeadlines': _parseList(_preferredHeadlinesController.text),
      'scrollPastTopics': _parseList(_scrollPastTopicsController.text),
      'jobIndustry': _valueOrNull(_jobIndustryController),
      'demographic': _valueOrNull(_demographicController),
      'location': _valueOrNull(_locationController),
      'lifeStage': _valueOrNull(_lifeStageController),
      'newsStyle': _valueOrNull(_newsStyleController),
      'newsScope': _valueOrNull(_newsScopeController),
    };

    preferences.removeWhere(
      (key, value) =>
          value == null ||
          (value is String && value.isEmpty),
    );

    final payload = <String, dynamic>{
      'name': _valueOrNull(_nameController),
      'timezone': _valueOrNull(_timezoneController),
      'notificationPrefs': {
        'onBriefingReady': _notifyOnBriefing,
      },
      'preferences': preferences,
    };

    payload.removeWhere(
      (key, value) =>
          value == null ||
          (value is String && value.isEmpty),
    );

    final success = await authProvider.updateUserProfile(payload);

    if (!mounted) return;

    setState(() {
      _isSaving = false;
      _errorMessage = success ? null : authProvider.errorMessage;
    });

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profile updated successfully'),
          backgroundColor: AppTheme.darkGray,
        ),
      );
      Navigator.of(context).pop(true);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.offWhite,
      appBar: AppBar(
        title: const Text('Edit Profile'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppTheme.paddingPage),
          child: Card(
            color: AppTheme.warmBeige,
            child: Padding(
              padding: const EdgeInsets.all(AppTheme.paddingCard),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Personal Details',
                      style: Theme.of(context).textTheme.displayMedium,
                    ),
                    const SizedBox(height: AppTheme.spacingLarge),
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'Name',
                        hintText: 'Your full name',
                      ),
                      validator: (value) {
                        if (value == null || value.trim().isEmpty) {
                          return 'Please enter your name';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: AppTheme.spacingMedium),
                    Text(
                      'Email',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: AppTheme.spacingSmall),
                    Text(
                      _email,
                      style: Theme.of(context).textTheme.bodyLarge,
                    ),
                    const SizedBox(height: AppTheme.spacingMedium),
                    TextFormField(
                      controller: _timezoneController,
                      decoration: const InputDecoration(
                        labelText: 'Timezone',
                        hintText: 'e.g., America/Los_Angeles',
                      ),
                    ),
                    const SizedBox(height: AppTheme.spacingLarge),
                    Text(
                      'About You',
                      style: Theme.of(context).textTheme.displayMedium,
                    ),
                    const SizedBox(height: AppTheme.spacingMedium),
                    TextFormField(
                      controller: _locationController,
                      decoration: const InputDecoration(
                        labelText: 'Location',
                        hintText: 'City, state, or country',
                      ),
                    ),
                    const SizedBox(height: AppTheme.spacingMedium),
                    TextFormField(
                      controller: _lifeStageController,
                      decoration: const InputDecoration(
                        labelText: 'Life Stage',
                        hintText: 'Student, parent, retiree...',
                      ),
                    ),
                    const SizedBox(height: AppTheme.spacingMedium),
                    TextFormField(
                      controller: _jobIndustryController,
                      decoration: const InputDecoration(
                        labelText: 'Job Industry',
                        hintText: 'Tech, finance, education...',
                      ),
                    ),
                    const SizedBox(height: AppTheme.spacingMedium),
                    TextFormField(
                      controller: _demographicController,
                      decoration: const InputDecoration(
                        labelText: 'Demographic',
                        hintText: 'Optional demographic details',
                      ),
                    ),
                    const SizedBox(height: AppTheme.spacingLarge),
                    Text(
                      'Preferences',
                      style: Theme.of(context).textTheme.displayMedium,
                    ),
                    const SizedBox(height: AppTheme.spacingMedium),
                    TextFormField(
                      controller: _topicsController,
                      decoration: const InputDecoration(
                        labelText: 'Topics that grab your attention',
                        hintText: 'Separate with commas',
                      ),
                      maxLines: 2,
                    ),
                    const SizedBox(height: AppTheme.spacingMedium),
                    TextFormField(
                      controller: _interestsController,
                      decoration: const InputDecoration(
                        labelText: 'General interests',
                        hintText: 'Separate with commas',
                      ),
                      maxLines: 2,
                    ),
                    const SizedBox(height: AppTheme.spacingMedium),
                    TextFormField(
                      controller: _preferredHeadlinesController,
                      decoration: const InputDecoration(
                        labelText: 'Preferred headlines',
                        hintText: 'Separate with commas',
                      ),
                      maxLines: 2,
                    ),
                    const SizedBox(height: AppTheme.spacingMedium),
                    TextFormField(
                      controller: _scrollPastTopicsController,
                      decoration: const InputDecoration(
                        labelText: 'Headlines you skip',
                        hintText: 'Separate with commas',
                      ),
                      maxLines: 2,
                    ),
                    const SizedBox(height: AppTheme.spacingMedium),
                    TextFormField(
                      controller: _newsStyleController,
                      decoration: const InputDecoration(
                        labelText: 'News style',
                        hintText: 'Quick summaries, deep dives...',
                      ),
                    ),
                    const SizedBox(height: AppTheme.spacingMedium),
                    TextFormField(
                      controller: _newsScopeController,
                      decoration: const InputDecoration(
                        labelText: 'News scope',
                        hintText: 'Global, local, or both',
                      ),
                    ),
                    const SizedBox(height: AppTheme.spacingLarge),
                    SwitchListTile(
                      title: const Text('Notify me when my briefing is ready'),
                      value: _notifyOnBriefing,
                      onChanged: (value) {
                        setState(() {
                          _notifyOnBriefing = value;
                        });
                      },
                    ),
                    if (_errorMessage != null) ...[
                      const SizedBox(height: AppTheme.spacingMedium),
                      Text(
                        _errorMessage!,
                        style: const TextStyle(color: Colors.red),
                      ),
                    ],
                    const SizedBox(height: AppTheme.spacingLarge),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        TextButton(
                          onPressed: _isSaving
                              ? null
                              : () {
                                  Navigator.of(context).pop();
                                },
                          child: const Text('Cancel'),
                        ),
                        const SizedBox(width: AppTheme.spacingMedium),
                        ElevatedButton(
                          onPressed: _isSaving ? null : _saveProfile,
                          child: _isSaving
                              ? const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Text('Save Changes'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
