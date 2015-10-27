module MaintenanceTest

import lang::java::jdt::m3::Core;
import Set;
import List;
import metrics::java::LOC;

public M3 v =  createM3FromEclipseProject(|project://hello-world-java|);

public int getRelevantLines(str name) {
	list[loc] xs = toList({s | <s,_> <- v@containment, s.scheme == "java+compilationUnit", s.file == name});
	loc x = head(xs);
	return relevantLines(x);
}
test bool testFileLineCount1() = getRelevantLines("CommentSameLine.java") == 6;
test bool testFileLineCount2() = getRelevantLines("ControlLoop.java") == 10;
test bool testFileLineCount3() = getRelevantLines("ControlLoopWithComment.java") == 10;
test bool testFileLineCount4() = getRelevantLines("Empty.java") == 3;
test bool testFileLineCount5() = getRelevantLines("EmptyWithComment.java") == 3;
test bool testFileLineCount6() = getRelevantLines("MethodComment.java") == 6;
test bool testFileLineCount7() = getRelevantLines("Robot.java") == 9;
test bool testFileLineCount8() = getRelevantLines("SimplePojo.java") == 5;
test bool testFileLineCount9() = getRelevantLines("WithMethod.java") == 6;