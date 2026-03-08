class PyqTopicData {
  final String topicName;
  final String subject;
  final int totalMarksContribution;
  final int appearanceCount;
  final String priorityLevel;

  PyqTopicData({
    required this.topicName,
    required this.subject,
    required this.totalMarksContribution,
    required this.appearanceCount,
    required this.priorityLevel,
  });

  factory PyqTopicData.fromJson(Map<String, dynamic> json) {
    return PyqTopicData(
      topicName: json['topic_name'] as String,
      subject: json['subject'] as String,
      totalMarksContribution: json['total_marks_contribution'] as int,
      appearanceCount: json['appearance_count'] as int,
      priorityLevel: json['priority_level'] as String,
    );
  }
}
