import '../../core/network/api_client.dart';
import '../../core/constants/api_constants.dart';
import '../models/academic_event_model.dart';

class CalendarRepository {
  final ApiClient _api = ApiClient();


  Future<List<AcademicEventModel>> getEvents() async {
    try {
      final response = await _api.get(ApiConstants.events);
      final List data =
          response.data is List ? response.data : response.data['items'] ?? [];
      return data.map((json) => AcademicEventModel.fromJson(json)).toList();
    } catch (e) {
      rethrow;
    }
  }

  Future<AcademicEventModel> createEvent({
    required String title,
    String? description,
    required DateTime eventDate,
    String? location,
  }) async {
    final response = await _api.post(
      ApiConstants.events,
      data: {
        'title': title,
        if (description != null) 'description': description,
        'event_date': eventDate.toUtc().toIso8601String(),
        if (location != null) 'location': location,
      },
    );
    return AcademicEventModel.fromJson(response.data);
  }
}
