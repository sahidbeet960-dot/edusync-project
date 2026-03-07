class AcademicEventModel {
  final String id;
  final String title;
  final String? description;
  final DateTime eventDate;
  final String? location;
  final String? createdById;
  final DateTime? createdAt;

  AcademicEventModel({
    required this.id,
    required this.title,
    this.description,
    required this.eventDate,
    this.location,
    this.createdById,
    this.createdAt,
  });

  factory AcademicEventModel.fromJson(Map<String, dynamic> json) {
    return AcademicEventModel(
      id: json['id'].toString(),
      title: json['title'] ?? '',
      description: json['description'],
      eventDate: json['event_date'] != null
          ? DateTime.parse(json['event_date'])
          : DateTime.now(),
      location: json['location'],
      createdById: json['created_by_id']?.toString(),
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'title': title,
        'description': description,
        'event_date': eventDate.toIso8601String(),
        'location': location,
      };

  bool get isUpcoming => eventDate.isAfter(DateTime.now());
  bool get isPast => eventDate.isBefore(DateTime.now());
}
