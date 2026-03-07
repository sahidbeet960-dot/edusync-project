/// Model for saving a study session: POST /api/v1/study/sessions
class StudySessionModel {
  final String roomId;
  final int durationSeconds;

  StudySessionModel({
    required this.roomId,
    required this.durationSeconds,
  });

  Map<String, dynamic> toJson() => {
        'room_id': roomId,
        'duration_seconds': durationSeconds,
      };
}

/// Model for study stats: GET /api/v1/study/my-stats
class StudyStatsModel {
  final int userId;
  final int totalStudySeconds;
  final int totalStudyMinutes;

  StudyStatsModel({
    required this.userId,
    required this.totalStudySeconds,
    required this.totalStudyMinutes,
  });

  factory StudyStatsModel.fromJson(Map<String, dynamic> json) {
    return StudyStatsModel(
      userId: json['user_id'] ?? 0,
      totalStudySeconds: json['total_study_seconds'] ?? 0,
      totalStudyMinutes: json['total_study_minutes'] ?? 0,
    );
  }

  String get formattedDuration {
    final hours = totalStudyMinutes ~/ 60;
    final minutes = totalStudyMinutes % 60;
    if (hours > 0) return '${hours}h ${minutes}m';
    return '${minutes}m';
  }
}
