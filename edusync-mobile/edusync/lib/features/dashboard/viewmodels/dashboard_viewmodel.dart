import 'package:flutter/material.dart';
import '../../../data/models/academic_event_model.dart';
import '../../../data/models/material_model.dart';
import '../../../data/repositories/calendar_repository.dart';
import '../../../data/repositories/material_repository.dart';

class DashboardViewModel extends ChangeNotifier {
  final CalendarRepository _calendarRepo = CalendarRepository();
  final MaterialRepository _materialRepo = MaterialRepository();

  bool _isLoading = false;
  bool _hasLoaded = false;
  List<AcademicEventModel> _upcomingEvents = [];
  List<MaterialModel> _recentMaterials = [];
  String? _error;

  bool get isLoading => _isLoading;
  List<AcademicEventModel> get upcomingEvents => _upcomingEvents;
  List<MaterialModel> get recentMaterials => _recentMaterials;
  String? get error => _error;

  Future<void> loadDashboard({bool forceRefresh = false}) async {
    if (_hasLoaded && !forceRefresh) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      // With MaterialRepository properly imported, this compiles flawlessly.
      final results = await Future.wait([
        _calendarRepo.getEvents(),
        _materialRepo.getMaterials(),
      ]);

      _upcomingEvents = (results[0] as List<AcademicEventModel>)
          .where((e) => e.isUpcoming)
          .take(3)
          .toList();

      _recentMaterials = (results[1] as List<MaterialModel>).take(10).toList();
          
      _hasLoaded = true;
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }
}