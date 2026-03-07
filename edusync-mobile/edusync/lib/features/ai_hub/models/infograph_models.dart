class HeatmapCell {
  final String topic;
  final String year;
  final double marks;

  HeatmapCell({
    required this.topic,
    required this.year,
    required this.marks,
  });

  factory HeatmapCell.fromJson(Map<String, dynamic> json) {
    return HeatmapCell(
      topic: json['topic'] as String,
      year: json['year'] as String,
      marks: (json['marks'] as num).toDouble(),
    );
  }
}

class HeatmapData {
  final List<HeatmapCell> cells;

  HeatmapData({required this.cells});

  factory HeatmapData.fromJson(Map<String, dynamic> json) {
    var cellsJson = json['cells'] as List;
    List<HeatmapCell> cellsList = cellsJson.map((i) => HeatmapCell.fromJson(i)).toList();
    return HeatmapData(cells: cellsList);
  }
}

class PieChartShare {
  final String chapter;
  final double totalMarks;

  PieChartShare({
    required this.chapter,
    required this.totalMarks,
  });

  factory PieChartShare.fromJson(Map<String, dynamic> json) {
    return PieChartShare(
      chapter: json['chapter'] as String,
      totalMarks: (json['total_marks'] as num).toDouble(),
    );
  }
}

class PieChartData {
  final String subject;
  final List<PieChartShare> shares;

  PieChartData({
    required this.subject,
    required this.shares,
  });

  factory PieChartData.fromJson(Map<String, dynamic> json) {
    var sharesJson = json['shares'] as List;
    List<PieChartShare> sharesList = sharesJson.map((i) => PieChartShare.fromJson(i)).toList();
    return PieChartData(
      subject: json['subject'] as String,
      shares: sharesList,
    );
  }
}
