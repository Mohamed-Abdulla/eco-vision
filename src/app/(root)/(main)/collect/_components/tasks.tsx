"use client";
import { Button } from "@/components/ui/button";
import { updateTaskStatus } from "@/utils/db/actions/collection.actions";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Calendar, CheckCircle, Clock, Loader, MapPin, Trash2, Upload, Weight } from "lucide-react";
import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface TasksProps {
  tasks: CollectionTask[];
  userId: string;
}
const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export const Tasks: FC<TasksProps> = ({ tasks, userId }) => {
  const [tasksData, setTasksData] = useState<CollectionTask[]>([]);
  const [hoveredWasteType, setHoveredWasteType] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<CollectionTask | null>(null);
  const [verificationImage, setVerificationImage] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "verifying" | "success" | "failure">("idle");
  const [verificationResult, setVerificationResult] = useState<{
    wasteTypeMatch: boolean;
    quantityMatch: boolean;
    confidence: number;
  } | null>(null);

  useEffect(() => {
    setTasksData(tasks);
  }, [tasks]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVerificationImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const readFileAsBase64 = (dataUrl: string): string => {
    return dataUrl.split(",")[1];
  };

  const handleStatusChange = async (taskId: string, newStatus: CollectionTask["status"]) => {
    if (!userId) {
      toast.error("Please log in to collect waste.");
      return;
    }

    try {
      const updatedTask = await updateTaskStatus(taskId, newStatus, userId);
      if (updatedTask) {
        setTasksData(
          tasksData.map((task) => (task.id === taskId ? { ...task, status: newStatus, collectorId: userId } : task))
        );
        toast.success("Task status updated successfully");
      } else {
        toast.error("Failed to update task status. Please try again.");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status. Please try again.");
    }
  };

  const handleVerify = async () => {
    if (!selectedTask || !verificationImage || !userId) {
      toast.error("Missing required information for verification.");
      return;
    }

    setVerificationStatus("verifying");

    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey!);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const base64Data = readFileAsBase64(verificationImage);

      const imageParts = [
        {
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg", // Adjust this if you know the exact type
          },
        },
      ];
      const confidenceThreshold = 0.8; // Minimum confidence required
      const similarityThreshold = 0.75; // Allow some tolerance for image variations

      const prompt = `You are an expert in waste management and recycling. Analyze this image and provide:
        1. Confirm if the waste type is similar to: "${
          selectedTask.wasteType
        }" (even if lighting or angle changes slightly).
        2. Estimate if the quantity is approximately similar to: "${
          selectedTask.amount
        }" (considering minor variations).
        3. Your confidence level in this assessment (as a percentage).
        4. Whether the confidence level meets the required threshold of ${confidenceThreshold * 100}%.
        5. Whether the waste type similarity meets at least ${
          similarityThreshold * 100
        }% similarity to be considered a match.
      
        Respond in JSON format like this:
        {
          "wasteTypeMatch": true/false,
          "wasteTypeSimilarity": value between 0 and 1 (1 means exact match),
          "quantityMatch": true/false,
          "confidence": confidence level as a number between 0 and 1,
          "meetsThreshold": true/false
        }`;

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = result.response;
      const text = response.text();
      const cleanedText = text.trim().replace(/^```json\s*|\s*```$/g, "");

      try {
        const parsedResult = JSON.parse(cleanedText);
        setVerificationResult({
          wasteTypeMatch: parsedResult.wasteTypeMatch,
          quantityMatch: parsedResult.quantityMatch,
          confidence: parsedResult.confidence,
        });
        setVerificationStatus("success");

        if (parsedResult.wasteTypeMatch && parsedResult.quantityMatch && parsedResult.confidence > 0.7) {
          await handleStatusChange(selectedTask.id, "verified");
          const earnedReward = Math.floor(Math.random() * 50) + 10; // Random reward between 10 and 59

          // Save the reward
          //   await saveReward(user.id, earnedReward)

          // Save the collected waste
          //   await saveCollectedWaste(selectedTask.id, user.id, parsedResult)

          //   setReward(earnedReward)
          toast.success(`Verification successful! You earned ${earnedReward} tokens!`, {
            duration: 5000,
            position: "top-center",
          });
        } else {
          toast.error("Verification failed. The collected waste does not match the reported waste.", {
            duration: 5000,
            position: "top-center",
          });
        }
      } catch (error) {
        console.log(error);

        console.error("Failed to parse JSON response:", text);
        setVerificationStatus("failure");
        toast.error("Failed to verify the collected waste. Please try again.");
      }
    } catch (error) {
      console.error("Error verifying waste:", error);
      setVerificationStatus("failure");
      toast.error("Failed to verify the collected waste. Please try again.");
    }
  };

  return (
    <div className="space-y-3">
      {tasksData.map((task) => (
        <div key={task.id} className="bg-white p-4  rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium text-gray-800 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-gray-500" />
              {task.location}
            </h2>
            <StatusBadge status={task.status} />
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
            <div className="flex items-center relative">
              <Trash2 className="w-4 h-4 mr-2 text-gray-500" />
              <span
                onMouseEnter={() => setHoveredWasteType(task.wasteType)}
                onMouseLeave={() => setHoveredWasteType(null)}
                className="cursor-pointer"
              >
                {task.wasteType.length > 10 ? `${task.wasteType.slice(0, 10)}...` : task.wasteType}
              </span>
              {hoveredWasteType === task.wasteType && (
                <div className="absolute left-0 top-full mt-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10">
                  {task.wasteType}
                </div>
              )}
            </div>
            <div className="flex items-center">
              <Weight className="w-4 h-4 mr-2 text-gray-500" />
              {task.amount}
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
              {task.date}
            </div>
          </div>
          <div className="flex justify-end">
            {task.status === "pending" && (
              <Button onClick={() => handleStatusChange(task.id, "in_progress")} variant="outline" size="sm">
                Start Collection
              </Button>
            )}
            {task.status === "in_progress" && task.collectorId === userId && (
              <Button onClick={() => setSelectedTask(task)} variant="outline" size="sm">
                Complete & Verify
              </Button>
            )}
            {task.status === "in_progress" && task.collectorId !== userId && (
              <span className="text-yellow-600 text-sm font-medium">In progress by another collector</span>
            )}
            {task.status === "verified" && <span className="text-green-600 text-sm font-medium">Reward Earned</span>}
          </div>
        </div>
      ))}

      {selectedTask && (
        <div className="fixed top-15 inset-0 bg-slate-100 backdrop-blur-3xl bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Verify Collection</h3>
            <p className="mb-4 text-sm text-gray-600">
              Upload a photo of the collected waste to verify and earn your reward.
            </p>
            <div className="mb-4">
              <label htmlFor="verification-image" className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="verification-image"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="verification-image"
                        name="verification-image"
                        type="file"
                        className="sr-only"
                        onChange={handleImageUpload}
                        accept="image/*"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
            {verificationImage && <img src={verificationImage} alt="Verification" className="mb-4 rounded-md w-full" />}
            <Button
              onClick={handleVerify}
              className="w-full"
              disabled={!verificationImage || verificationStatus === "verifying"}
            >
              {verificationStatus === "verifying" ? (
                <>
                  <Loader className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Verifying...
                </>
              ) : (
                "Verify Collection"
              )}
            </Button>
            {verificationStatus === "success" && verificationResult && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <p>Waste Type Match: {verificationResult.wasteTypeMatch ? "Yes" : "No"}</p>
                <p>Quantity Match: {verificationResult.quantityMatch ? "Yes" : "No"}</p>
                <p>Confidence: {(verificationResult.confidence * 100).toFixed(2)}%</p>
              </div>
            )}
            {verificationStatus === "failure" && (
              <p className="mt-2 text-red-600 text-center text-sm">Verification failed. Please try again.</p>
            )}
            <Button onClick={() => setSelectedTask(null)} variant="outline" className="w-full mt-2">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

function StatusBadge({ status }: { status: CollectionTask["status"] }) {
  const statusConfig = {
    pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
    in_progress: { color: "bg-blue-100 text-blue-800", icon: Trash2 },
    completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
    verified: { color: "bg-purple-100 text-purple-800", icon: CheckCircle },
  };

  const { color, icon: Icon } = statusConfig[status];

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color} flex items-center`}>
      <Icon className="mr-1 h-3 w-3" />
      {status.replace("_", " ")}
    </span>
  );
}
