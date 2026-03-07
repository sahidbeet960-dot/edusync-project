import 'package:flutter/material.dart';
import '../../../data/models/academic_event_model.dart';
import '../../../data/repositories/calendar_repository.dart';

class CalendarViewModel extends ChangeNotifier {
  final CalendarRepository _repo = CalendarRepository();

  bool _isLoading = false;
  bool _hasLoaded = false;
  List<AcademicEventModel> _events = [];
  String? _error;
  DateTime _selectedDate = DateTime.now();

  bool get isLoading => _isLoading;
  List<AcademicEventModel> get events => _events;
  String? get error => _error;
  DateTime get selectedDate => _selectedDate;

  List<AcademicEventModel> get eventsForSelectedDate {
    return _events.where((e) {
      return e.eventDate.year == _selectedDate.year &&
          e.eventDate.month == _selectedDate.month &&
          e.eventDate.day == _selectedDate.day;
    }).toList();
  }

  List<AcademicEventModel> get upcomingEvents {
    return _events.where((e) => e.isUpcoming).toList()
      ..sort((a, b) => a.eventDate.compareTo(b.eventDate));
  }

  void selectDate(DateTime date) {
    _selectedDate = date;
    notifyListeners();
  }

  Future<void> loadEvents({bool forceRefresh = false}) async {
    if (_hasLoaded && !forceRefresh) return;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _events = await _repo.getEvents();
      _hasLoaded = true;
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> createEvent({
    required String title,
    String? description,
    required DateTime eventDate,
    String? location,
  }) async {
    try {
      final event = await _repo.createEvent(
        title: title,
        description: description,
        eventDate: eventDate,
        location: location,
      );
      _events.add(event);
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
}
