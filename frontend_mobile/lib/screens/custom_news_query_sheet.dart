import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class CustomNewsQuerySheet extends StatefulWidget {
  const CustomNewsQuerySheet({super.key});

  @override
  State<CustomNewsQuerySheet> createState() => _CustomNewsQuerySheetState();
}

class _CustomNewsQuerySheetState extends State<CustomNewsQuerySheet> {
  final _formKey = GlobalKey<FormState>();
  final _topicsController = TextEditingController();
  final _includeController = TextEditingController();
  final _excludeController = TextEditingController();
  final _sourcesController = TextEditingController();

  String _language = 'en';
  String _format = 'narrative';

  @override
  void dispose() {
    _topicsController.dispose();
    _includeController.dispose();
    _excludeController.dispose();
    _sourcesController.dispose();
    super.dispose();
  }

  List<String> _splitList(String value) {
    return value
        .split(',')
        .map((item) => item.trim())
        .where((item) => item.isNotEmpty)
        .toList();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;

    final payload = <String, dynamic>{
      'topics': _splitList(_topicsController.text),
      'includeKeywords': _splitList(_includeController.text),
      'excludeKeywords': _splitList(_excludeController.text),
      'preferredSources': _splitList(_sourcesController.text),
      'language': _language,
      'format': _format,
    };

    payload.removeWhere(
      (key, value) => value == null || (value is List && value.isEmpty),
    );

    Navigator.of(context).pop(payload);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(AppTheme.paddingPage),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Custom News Query',
                style: Theme.of(context).textTheme.displayMedium,
              ),
              const SizedBox(height: AppTheme.spacingMedium),
              TextFormField(
                controller: _topicsController,
                decoration: const InputDecoration(
                  labelText: 'Topics (comma separated)',
                  hintText: 'climate tech, fintech, geopolitics',
                ),
              ),
              const SizedBox(height: AppTheme.spacingMedium),
              TextFormField(
                controller: _includeController,
                decoration: const InputDecoration(
                  labelText: 'Include keywords',
                  hintText: 'IPO, chip shortage, Series A...',
                ),
              ),
              const SizedBox(height: AppTheme.spacingMedium),
              TextFormField(
                controller: _excludeController,
                decoration: const InputDecoration(
                  labelText: 'Exclude keywords',
                  hintText: 'sports, celebrity, gossip...',
                ),
              ),
              const SizedBox(height: AppTheme.spacingMedium),
              TextFormField(
                controller: _sourcesController,
                decoration: const InputDecoration(
                  labelText: 'Preferred sources',
                  hintText: 'the-verge, bloomberg, financial-times',
                ),
              ),
              const SizedBox(height: AppTheme.spacingMedium),
              Row(
                children: [
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _language,
                      decoration: const InputDecoration(labelText: 'Language'),
                      items: const [
                        DropdownMenuItem(value: 'en', child: Text('English')),
                        DropdownMenuItem(value: 'es', child: Text('Spanish')),
                        DropdownMenuItem(value: 'fr', child: Text('French')),
                        DropdownMenuItem(value: 'de', child: Text('German')),
                        DropdownMenuItem(value: 'it', child: Text('Italian')),
                        DropdownMenuItem(value: 'pt', child: Text('Portuguese')),
                        DropdownMenuItem(value: 'ru', child: Text('Russian')),
                        DropdownMenuItem(value: 'zh', child: Text('Chinese')),
                      ],
                      onChanged: (value) {
                        if (value != null) {
                          setState(() => _language = value);
                        }
                      },
                    ),
                  ),
                  const SizedBox(width: AppTheme.spacingSmall),
                  Expanded(
                    child: DropdownButtonFormField<String>(
                      value: _format,
                      decoration: const InputDecoration(labelText: 'Format'),
                      items: const [
                        DropdownMenuItem(
                          value: 'narrative',
                          child: Text('Narrative overview'),
                        ),
                        DropdownMenuItem(
                          value: 'bullet_points',
                          child: Text('Bullet highlights'),
                        ),
                      ],
                      onChanged: (value) {
                        if (value != null) {
                          setState(() => _format = value);
                        }
                      },
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppTheme.spacingLarge),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text('Cancel'),
                  ),
                  const SizedBox(width: AppTheme.spacingSmall),
                  ElevatedButton(
                    onPressed: _submit,
                    child: const Text('Run Query'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
